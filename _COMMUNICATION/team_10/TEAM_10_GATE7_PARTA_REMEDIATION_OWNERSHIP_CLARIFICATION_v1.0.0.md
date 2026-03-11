# Team 10 — GATE_7 Part A: מי מתקן מה (כדי לקבל PASS מלא)

**project_domain:** TIKTRACK  
**id:** TEAM_10_GATE7_PARTA_REMEDIATION_OWNERSHIP_CLARIFICATION_v1.0.0  
**from:** Team 10 (Gateway)  
**to:** Team 20, Team 60, Team 90 (CC: Team 50)  
**date:** 2026-03-11  
**purpose:** הבהרת אחריות ותיקונים נדרשים ל־GATE_7 Part A full PASS

---

## 1) מה נדרש ל־PASS מלא (לפי מנדט v2.0.1)

| Condition | דרישה ל־PASS | סטטוס נוכחי |
|-----------|--------------|-------------|
| **CC-WP003-01** | לוג נתיב + ספירת קריאות Yahoo מפורשת במחזור **market-open**; סף: ≤5 קריאות | NOT EVIDENCED (לא בוצע ריצת market-open עם ספירה) |
| **CC-WP003-02** | **חלון off-hours נפרד** + ספירת קריאות Yahoo מפורשת; סף: ≤2 קריאות | NOT EVIDENCED (לא בוצע capture off-hours נפרד) |
| **CC-WP003-04** | 4 מחזורים רצופים באותו חלון; ספירת 429 מפורשת; סף: **0** מופעי 429 | BLOCK (3× 429 בלוג) |

---

## 2) מי אחראי על מה

### CC-WP003-04 (0× 429) — **Team 20 (Backend)**

- **בעיה:** Yahoo מחזיר 429 (rate limit); במדידה היו 3 מופעים ב־4 מחזורים.
- **אחריות:** **Team 20** — לוגיקת ה־provider (Yahoo): backoff, cooldown, דיליי בין בקשות, או צמצום מספר הקריאות כך שבמרווח של ~1h (4 מחזורים) לא יופיע 429.
- **Team 60:** מריץ את האיסוף ומדווח ספירה; לא מתקן קוד.

### CC-WP003-01 (market-open, ≤5) — **Team 60 + Team 20**

- **איסוף עדות:** **Team 60** — להריץ מחזור sync ב־**market-open**, לרשום נתיב לוג, ולספור קריאות Yahoo באותו מחזור (כולל instrumentation/לוג אם צריך).
- **התנהגות מוצר:** **Team 20** — להבטיח שבמחזור market-open המערכת מבצעת ≤5 קריאות ל־Yahoo (אם כיום יש יותר — לתקן/להגביל).

### CC-WP003-02 (off-hours, ≤2) — **Team 60 + Team 20**

- **איסוף עדות:** **Team 60** — להריץ **חלון off-hours נפרד** (לא באותו ריצה כמו market-open), לרשום לוג ולספור קריאות Yahoo.
- **התנהגות מוצר:** **Team 20** — להבטיח שב־off-hours המערכת מבצעת ≤2 קריאות ל־Yahoo.

---

## 3) סיכום פעולות נדרשות

| צוות | פעולה |
|------|--------|
| **Team 20** | 1) תיקון/הפחתת 429 מ־Yahoo (CC-04 → 0). 2) וידוא ש־market-open ≤5 קריאות Yahoo ו־off-hours ≤2 (ואם לא — תיקון). |
| **Team 60** | 1) ריצת איסוף evidence ל־CC-01 (market-open + לוג + ספירת Yahoo). 2) ריצת איסוף נפרד ל־CC-02 (off-hours + לוג + ספירת Yahoo). 3) לאחר תיקון Team 20 — ריצה חוזרת ל־CC-04 (4 מחזורים, ספירת 429). עדכון דוח + JSON. |
| **Team 50** | Corroboration לדוח Team 60 (התאמה verdicts). |

---

**log_entry | TEAM_10 | GATE7_PARTA_REMEDIATION_OWNERSHIP | CLARIFICATION | 2026-03-11**
