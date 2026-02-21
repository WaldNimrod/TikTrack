# Team 170 → Team 190 — Domain Refactor Validation Request

**id:** TEAM_170_TO_TEAM_190_DOMAIN_REFACTOR_VALIDATION_REQUEST_v1.0.0  
**from:** Team 170 (Librarian & Structural Custodian)  
**to:** Team 190 (Constitutional Architectural Validator)  
**cc:** Team 100 (Development Architecture Lead)  
**date:** 2026-02-21  
**status:** VALIDATION_REQUESTED  
**project_domain:** AGENTS_OS

---

## 1) בקשת ולידציה

Team 170 מבקש מ־Team 190 **ולידציה חוקתית** על ביצוע ה־Domain Refactor לפי הדרישה המקורית של Team 100 והסקופ שאומץ.

---

## 2) הדרישה המקורית (Team 100)

**מסמך מקור (קישור מחייב):**  
`_COMMUNICATION/team_100/TEAM_100_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_v1.0.0.md`

**תמצית הדרישה:**

- **מטרה:** בידוד מבני מלא בין התחומים TIKTRACK | AGENTS_OS | SHARED (refactor מבני, לא עדכון תיעוד בלבד).
- **פעולות חובה:**  
  1. יצירת תיקיית שורש `/agents_os/` ומבנה (documentation, docs-system, docs-governance, runtime, validators, orchestrator, tests).  
  2. סריקת הריפו לאיתור אזכורי Agent_OS, Agents_OS, Governance runtime.  
  3. סיווג כל ארטיפקט: TIKTRACK | AGENTS_OS | SHARED.  
  4. העברה פיזית (MOVE) של ארטיפקטי AGENTS_OS תחת `/agents_os/`.  
  5. הוספת header חובה לכל מסמכי markdown: `project_domain: TIKTRACK | AGENTS_OS | SHARED`.  
  6. איחוד legacy `_ARCHITECTURAL_INBOX` לנתיב הקנוני `_COMMUNICATION/_ARCHITECT_INBOX/`.  
  7. הפקת דוח מיפוי מבנה סופי: DOMAIN_REFACTOR_COMPLETION_REPORT_v1.0.0.md.
- **אילוצים:** אין מחיקות בלי מיקום ארכיון; אין כפילות; provenance לכל העברה; אין לוגיקת governance מחוץ ל־domain root.
- **דליברבל:** דוח מבני מאומת, מוגש ל־Team 190 לאימות.

---

## 3) הסקופ שאומץ (צמצום היקף)

כדי לבצע את העבודה בצורה מדויקת ומסודרת ויעילה:

- **קבצים זמניים / תקשורת ישנה (מלפני 7+ ימים) / שלבים שסגורים לחלוטין:** הועברו לארכיון (`_COMMUNICATION/99-ARCHIVE/`) **או** סומנו כ־legacy (שורת header אחת, ללא עריכת תוכן). לא בוצעה עריכה מבנית בקבצים אלה.
- **עדכון מלא (project_domain + נתיבים):** רק עבור **תוכניות פעילות** (S001-P001-WP001), **קבצים קבועים/קנוניים** (SSM, Gate protocol, Bible, TT2, Gateway, Master List, רג'יסטרים, תבניות), וקבצים של **שלבים שלא הסתיימו**.

**מסמך סקופ:** `_COMMUNICATION/team_170/TEAM_170_DOMAIN_REFACTOR_SCOPING_v1.0.0.md`

---

## 4) תוצרים מוגשים לולידציה

| # | תוצר | נתיב |
|---|------|------|
| 1 | דרישה מקורית (Team 100) | `_COMMUNICATION/team_100/TEAM_100_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_v1.0.0.md` |
| 2 | סקופינג | `_COMMUNICATION/team_170/TEAM_170_DOMAIN_REFACTOR_SCOPING_v1.0.0.md` |
| 3 | תוכנית ביצוע (Playbook) | `_COMMUNICATION/team_170/DOMAIN_REFACTOR_EXECUTION_PLAYBOOK_v1.0.0.md` |
| 4 | קליטת הוראה | `_COMMUNICATION/team_170/TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_INTAKE_v1.0.0.md` |
| 5 | דוח השלמה (לאחר ביצוע) | `_COMMUNICATION/team_170/DOMAIN_REFACTOR_COMPLETION_REPORT_v1.0.0.md` |

---

## 5) בקשת Team 190

- לאמת עמידה בדרישה המקורית של Team 100 (בהתאם לסקופ שאומץ).  
- לאמת עמידה באילוצים: אין מחיקות בלי ארכיון, אין כפילות, provenance להעברות, governance רק בתוך domain root.  
- להחזיר החלטת ולידציה: PASS / CONDITIONAL_PASS (עם רשימת תיקונים) / FAIL.

---

**log_entry | TEAM_170 | DOMAIN_REFACTOR_VALIDATION_REQUEST | SUBMITTED | 2026-02-21**
