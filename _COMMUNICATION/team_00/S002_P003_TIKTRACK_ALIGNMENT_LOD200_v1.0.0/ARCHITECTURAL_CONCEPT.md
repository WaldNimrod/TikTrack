---
id: S002_P003_TIKTRACK_ALIGNMENT_LOD200_ARCHITECTURAL_CONCEPT
owner: Chief Architect (Team 00)
status: ACTIVE
lod: 200
program: S002-P003
sv: 1.0.0
effective_date: 2026-02-26
---
**project_domain:** TIKTRACK

# LOD200 — אפיון ארכיטקטוני: S002-P003 TikTrack Alignment

---

## 1) מטרה

חבילת יישור הקו מביאה שלושה עמודים ממומשים לרמת **FAV PASS** מלאה לפני פתיחת S003.
הרעיון המנחה: לא בונים דברים חדשים — **מתקנים, משלימים, מבדקים, חותמים.**

---

## 2) שני חלקי העבודה

| WP | שם | צוות ראשי | תלות |
|----|-----|-----------|------|
| WP001 | D22 — השלמת פיצ'ר חסר (filter UI) | Team 30 | עצמאי |
| WP002 | D22+D34+D35 — Final Acceptance Validation | Team 50 | WP001 לD22; עצמאי לD34/D35 |

### 2.1 שרשרת שערים קנונית מחייבת (No Bypass)

```
GATE_0 (Team 190): LOD200 constitutional validation
→ GATE_1 (Team 170 submit, Team 190 validate): LLD400 spec lock
→ GATE_2 (Team 190 + Team 100/00 authority): architect approval
→ GATE_3 (Team 10): intake + execution activation for WP001/WP002
→ GATE_4..GATE_8 (Team 10/50/90/70 per protocol)
```

אין הפעלה של Team 10/30/50 לביצוע בפועל לפני `GATE_2 PASS` ופתיחת `GATE_3`.

---

## 3) WP001 — D22 Filter/Search UI (Team 30)

### מה קיים
- Backend: תומך `ticker_type`, `is_active`, `search`, `page`, `per_page`, `sort`, `order`
- Frontend: טוען `/tickers` ללא params; כל sorting ו-pagination — client-side בלבד

### מה נדרש לבנות
**שורת פילטרים מעל טבלת הטיקרים** — בדומה לדפוס הקיים ב-D34 (alerts).

#### Filter A — סוג טיקר (ticker_type)
- כפתורי toggle: `הכל | STOCK | ETF | CRYPTO | FOREX | OPTION | FUTURE | INDEX`
- לחיצה → `GET /tickers?ticker_type=STOCK` (backend filter)
- ברירת מחדל: הכל

#### Filter B — סטטוס (is_active)
- כפתורי toggle: `הכל | פעיל | לא פעיל`
- לחיצה → `GET /tickers?is_active=true` (backend filter)
- ברירת מחדל: הכל

### אילוצים ארכיטקטוניים
- MUST modify only `tickersTableInit.js` — לא כלים משותפים חדשים
- MUST use `sharedServices.get('/tickers', { ticker_type: ..., is_active: ... })`
- MUST follow existing filter patterns (check D34 `alertsTableInit.js` for reference)
- MUST NOT break existing pagination/sort logic
- MUST NOT add backend changes — backend already supports this

### קובץ לשינוי
```
ui/src/views/management/tickers/tickersTableInit.js
ui/src/views/management/tickers/tickers.content.html  ← add filter bar HTML
```

### הגדרת DONE לWP001
- [ ] Filter bar HTML מוסף ל-`tickers.content.html`
- [ ] `loadTickersData()` מעביר params לbackend
- [ ] לחיצה על filter → טבלה מתרעננת עם נתונים מפולטרים
- [ ] state נשמר בין page changes (active filter stays when paginating)
- [ ] SOP-013 Seal

---

## 4) WP002 — Final Acceptance Validation (Team 50)

### 4a. D34 — התראות (alerts.html)

**פערים ידועים מGate-A (per ARCHITECT_DIRECTIVE_D34_D35_FINAL_VALIDATION.md):**

| פער | סוג | מה לבדוק |
|-----|-----|-----------|
| CREATE alert via UI | E2E חסר | פתח form → מלא שדות → שמור → אשר row בטבלה |
| EDIT alert via UI | E2E חסר | לחץ edit → שנה שדות → שמור → אשר ערכים עודכנו |
| DELETE alert via UI | E2E חסר | לחץ delete → אשר dialog → אשר row נמחק מטבלה |
| is_active toggle | E2E חסר | לחץ toggle → אשר status badge מעודכן + API קיבל |
| price_threshold precision | CATS | צור alert עם 99.12345678 → GET back → השווה exact |

**Script שנדרש ליצור:**
```
scripts/run-alerts-d34-fav-api.sh   ← extended from existing Gate-A script
tests/alerts-d34-fav-e2e.test.js    ← extended from existing E2E
scripts/run-cats-precision.sh       ← new; D34 section first
```

### 4b. D35 — הערות (notes.html)

**פערים ידועים מGate-A (per ARCHITECT_DIRECTIVE_D34_D35_FINAL_VALIDATION.md):**

| פער | סוג | מה לבדוק |
|-----|-----|-----------|
| DELETE note via UI | E2E חסר | לחץ delete → אשר dialog → אשר row נמחק |
| Full CRUD round-trip | E2E חסר | Create → Read → Update → Delete — אחד test sequence |
| XSS sanitization | E2E חסר | הכנס `<script>alert('xss')</script>` בשדה → אשר render בטוח |

**Script שנדרש ליצור:**
```
tests/notes-d35-fav-e2e.test.js     ← extended from existing E2E
```

### 4c. D22 — ניהול טיקרים (tickers.html)
*(מתחיל לאחר WP001 sealed)*

| מה לבדוק | Script |
|-----------|--------|
| CRUD מלא (Create→Read→Update→Delete) | `scripts/run-tickers-d22-qa-api.sh` (חדש) |
| Filter UI פועל — type filter | `tests/tickers-d22-e2e.test.js` (חדש) |
| Filter UI פועל — status filter | `tests/tickers-d22-e2e.test.js` |
| Data integrity panel — select ticker | `tests/tickers-d22-e2e.test.js` |
| Summary stats נטענים | `tests/tickers-d22-e2e.test.js` |

---

## 5) אמות מידה איכות — חלים על כל הצוותים

### סטנדרטים מחייבים

| סטנדרט | מסמך |
|---------|------|
| Script: env vars בלבד (אין hardcode) | ARCHITECT_DIRECTIVE_QA_PROTOCOL_STANDARD.md §4.A |
| Script: JSON summary output + exit codes | ARCHITECT_DIRECTIVE_QA_PROTOCOL_STANDARD.md §4.B |
| Script: cleanup test data | ARCHITECT_DIRECTIVE_QA_PROTOCOL_STANDARD.md §4.A rule 6 |
| Bug report format מלא | ARCHITECT_DIRECTIVE_QA_PROTOCOL_STANDARD.md §4.D |
| DB backup לפני run | ARCHITECT_DIRECTIVE_TEST_INFRASTRUCTURE.md §4.B |
| CATS precision test לD34 | ARCHITECT_DIRECTIVE_CATS.md §4.B rule 6 |
| FAV מלא = CRUD+logic+error+regression | ARCHITECT_DIRECTIVE_FAV_PROTOCOL.md §4.A |
| מבנה LEGO — לא לוגיקה page-specific בshared | ARCHITECT_BASE_SYSTEMS_DESIGN_MANDATE.md |

### Environment Contract
```
BACKEND_URL=http://localhost:8082/api/v1
FRONTEND_URL=http://localhost:8080
ADMIN_USER=TikTrackAdmin
ADMIN_PASS=4181
```

---

## 6) ארכיטקטורה קיימת — אין לשנות

הפעולה הזו היא **alignment בלבד** — לא re-architecture.

| רכיב | מצב | הוראה |
|------|-----|-------|
| LEGO structure D22/D34/D35 | ✅ תקין | אל תשנה |
| Backend routers | ✅ מלאים | שנה רק אם test מגלה bug |
| maskedLog usage | ✅ ב-3 עמודים | שמור |
| 4-state status model | ✅ ב-3 עמודים | שמור |
| PhoenixModal (D34/D35) | ✅ קיים | שמא תחליף |
| sharedServices | ✅ קיים | השתמש בו |

---

## 7) הגדרת "DONE" לחבילה כולה

**S002-P003 sealed = כל התנאים הבאים מתקיימים:**

```
D22: ✅ filter UI עובד + API script 100% PASS + E2E 100% PASS + SOP-013
D34: ✅ CRUD UI E2E PASS + CATS PASS + error contracts PASS + regression PASS + SOP-013
D35: ✅ CRUD UI E2E PASS + XSS PASS + error contracts PASS + regression PASS + SOP-013
כל ה-QA reports: ✅ Team 50 format, updated date, failures: []
Gate sign-off: ✅ Team 90
Documentation: ✅ Team 70
```

**רק לאחר sealed → S003 GATE_0 מותר לפתוח.**

---

## 8) מה לא בסקופ (MUST NOT)

- אין שינוי ארכיטקטורה ב-3 העמודים
- אין הוספת פיצ'רים מעבר ל-filter UI בD22
- אין בניית D23 (דחוי)
- אין עבודה על S003+ pages

---

**log_entry | TEAM_00 | S002_P003_LOD200_ARCHITECTURAL_CONCEPT | ACTIVE | 2026-02-26**
