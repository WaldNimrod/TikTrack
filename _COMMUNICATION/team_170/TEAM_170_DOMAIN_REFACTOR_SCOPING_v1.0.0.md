# Domain Refactor — Scoping (צמצום היקף)

**id:** TEAM_170_DOMAIN_REFACTOR_SCOPING_v1.0.0  
**from:** Team 170  
**to:** Team 100, Team 190  
**re:** TEAM_100_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_v1.0.0  
**date:** 2026-02-21  
**project_domain:** AGENTS_OS

---

## 1) עקרון

לא לערוך עכשיו את **כל** הקבצים הישנים. לצמצם היקף:

- **קבצים זמניים ותקשורת ישנים (מלפני יותר משבוע)** → **ארכיון** או **סימון legacy** (לא עורכים במסגרת ה-refactor).
- **חובה לעדכן** — רק: **תוכניות פעילות**, **קבצים קבועים/קנוניים**, וקבצים של **שלבים שלא הסתיימו לחלוטין**.

---

## 2) ארכיון או סימון Legacy (לא לערוך)

| קריטריון | פעולה מומלצת |
|----------|---------------|
| **תאריך במסמך/קובץ** מלפני יותר מ־7 ימים (למשל לפני 2026-02-14) **ו**אינו חלק מתוכנית פעילה או קנון | העברה ל־`_COMMUNICATION/99-ARCHIVE/2026-02-XX/` (לפי תאריך ארכוב) **או** הוספת שורת header אחת: `project_domain: (TIKTRACK\|AGENTS_OS\|SHARED) — legacy; no structural edit per domain refactor directive.` |
| **קובץ זמני** (staging, draft, POC sample, one-off) | ארכיון או סימון legacy כאמור. |
| **שלב/באץ' שסגור לחלוטין** (כל המשימות CLOSED, אין תלויות פעילות) | ארכיון או סימון legacy; אין חובת עדכון תוכן. |

**מטרה:** לא לבזבז עריכות על קבצים שלא משפיעים על תוכניות פעילות או על קנון.

---

## 3) חובה לעדכן (in-scope)

| סוג | דוגמאות | פעולה |
|-----|---------|--------|
| **תוכניות פעילות** | S001-P001-WP001 (Dev Validator 10↔90) — כל קבצי ה־WP: WORK_PACKAGE_DEFINITION, PROMPTS_AND_ORDER, GATE3 activations, completion reports, QA submission, GATE5 request/response, וכל קובץ שמופיע ב־WORK_PACKAGE_DEFINITION או ב־MASTER_TASK_LIST תחת WP זה. | הוספת `project_domain: AGENTS_OS` (או TIKTRACK/SHARED לפי סיווג); התאמת נתיבים אם נדרש. |
| **קבצים קבועים/קנוניים** | PHOENIX_MASTER_SSM, 04_GATE_MODEL_PROTOCOL_v2.2.0, PHOENIX_MASTER_BIBLE, TT2_QUALITY_ASSURANCE_GATE_PROTOCOL, TEAM_10_GATEWAY_ROLE_AND_PROCESS, TEAM_10_MASTER_TASK_LIST_PROTOCOL, TEAM_10_MASTER_TASK_LIST, רג'יסטרים, תבניות הגשה (ARCHITECT_INBOX), ARCH_APPROVAL templates. | הוספת `project_domain`; יישור לנתיב קנוני (_COMMUNICATION/_ARCHITECT_INBOX וכו'). |
| **שלבים שלא הסתיימו** | כל קובץ שמתייחס ל־S001-P001-WP001 (סטטוס לא GATE_8 CLOSED); שלבים עם משימות OPEN/IN_PROGRESS; קבצי GATE נוכחי (GATE_3/4/5). | עדכון מלא (header + נתיבים אם רלוונטי). |

---

## 4) מבנה ארכיון (אם מעבירים)

- **נתיב:** `_COMMUNICATION/99-ARCHIVE/<YYYY-MM-DD>/` או `_COMMUNICATION/99-ARCHIVE/domain_refactor_2026-02/`  
- **כלל:** אין מחיקה בלי מיקום ארכיון. שמירת provenance (למשל רשימת קבצים שהועברו ב־DOMAIN_REFACTOR_COMPLETION_REPORT או ב־REFACTOR_LOG).

---

## 5) סדר עבודה מוצע

1. **שלב 0 (סקופינג):**  
   - לאתר קבצים "legacy" (מלפני 7+ ימים, זמניים, שלבים סגורים).  
   - להעביר לארכיון **או** להוסיף שורת legacy אחת (מינימלי).  
2. **שלב 1 (in-scope):**  
   - רשימת קבצים חובה: תוכנית פעילה (S001-P001-WP001), קנון, שלבים לא סגורים.  
   - לעדכן רק את הרשימה הזו (project_domain + נתיבים).  
3. **שלב 2:**  
   - המשך ה-refactor (העברת AGENTS_OS ל־agents_os/, דוח השלמה) לפי ההוראה.

---

**log_entry | TEAM_170 | DOMAIN_REFACTOR_SCOPING | v1.0.0 | 2026-02-21**
