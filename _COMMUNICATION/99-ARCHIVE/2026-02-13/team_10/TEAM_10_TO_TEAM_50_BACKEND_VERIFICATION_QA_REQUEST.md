# Team 10 → Team 50: סבב בדיקות מלא (Backend + Frontend D16/D18/D21 + Gate A)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 50 (QA)  
**תאריך:** 2026-02-12  
**הקשר:** Team 20 ו-Team 30 השלימו; מבוצע **סבב בדיקות מלא** (לא סבב מצומצם).

---

## 1. רקע

- **Team 20 (Backend):** דוח השלמת סשן — ADR-015, Rich-Text, ADR-016, D16 וולידציות.
- **Team 30 (Frontend):** דוח השלמת D16 Rollout — D18 ו-D21 תואמים לסטנדרט D16 (טפסים, פריסה, כפתורים, ולידציה, onSave async).

**בקשה:** להריץ **סבב בדיקות מלא** — צד שרת, צד לקוח (D16/D18/D21), ו-Gate A.

---

## 2. Scope — צד שרת (Backend)

| # | נושא | סוג בדיקה מוצע | רפרנס |
|---|------|----------------|--------|
| 1 | **ADR-015** — GET /reference/brokers, עמלות לפי חשבון | API: brokers response (display_name, is_supported, default_fees); D18 CRUD עם trading_account_id | TEAM_20_SESSION_COMPLETION_REPORT §2.1 |
| 2 | **Rich-Text** — cash_flows.description | API/round-trip: סניטיזציה ב-create/update; אופציונלי: test_rich_text_roundtrip.py | §2.2 |
| 3 | **ADR-016** — גרסאות | API: וידוא version ממקור יחיד (למשל GET /health או header) | §2.3 |
| 4 | **D16 וולידציות** | E2E/API: יצירת חשבון — ייחודיות account_name ו-account_number; קודי שגיאה ACCOUNT_NAME_DUPLICATE, ACCOUNT_NUMBER_DUPLICATE | §2.4 |
| 5 | **Gate A — Header Persistence** | E2E: Login → Home → Header נשאר (קיים ב-tests/gate-a-e2e.test.js) | תוכנית סגירת פערים Batch 1+2 |

---

## 3. Scope — צד לקוח (Frontend, D16 Rollout D18/D21)

**מקור:** TEAM_30_TO_TEAM_10_D16_ROLLOUT_D18_D21_COMPLETE

| # | נושא | סוג בדיקה מוצע |
|---|------|----------------|
| 1 | **D18 — מודול הוספת עמלה** | פתיחת מודול; פריסה דו-עמודתית (חשבון מסחר \| סוג עמלה; ערך עמלה \| מינימום); ולידציה; שמירה/שגיאת API (מודל נשאר פתוח); כפתור "שמירה", RTL. |
| 2 | **D21 — מודול הוספת תזרים** | פתיחת מודול; placeholder "– בחר חשבון מסחר –"; ולידציה; שמירה/שגיאה (מודל נשאר פתוח); כפתור "שמירה", RTL. |
| 3 | **עמידה ב-D16 reference** | וידוא form-row + form-group, כוכבית לשדות חובה, צבע שגיאה, כותרת מודול (Light BG + Dark). |

**בדיקה מנואלית מומלצת (מדוח Team 30):** פתיחת מודול D18 ומודול D21 — פריסה, ולידציה, שמירה ושגיאות. דיוק ויזואלי סופי — **מול G-Lead** לאחר מעבר הבדיקות.

---

## 4. תוצרים מבוקשים

- **דוח בדיקות** (או עדכון למפת Evidence) — אילו בדיקות הורצו, תוצאה (PASS/FAIL), נתיב ללוגים/ארטיפקטים אם רלוונטי.
- **אם FAIL:** דיווח ל-Team 10 (ולפי הצורך ל-Team 20 / Team 30) לצורך תיקון.

---

## 5. רפרנסים

| מסמך | נתיב |
|------|------|
| דוח השלמה Team 20 | documentation/05-REPORTS/artifacts_SESSION_01/TEAM_20_TO_TEAM_10_SESSION_COMPLETION_REPORT.md |
| דוח השלמה D16 Rollout Team 30 | _COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_D16_ROLLOUT_D18_D21_COMPLETE.md |
| D16 Reference SSOT | documentation/09-GOVERNANCE/standards/D16_MODULE_REFERENCE_SSOT.md |
| Gate A E2E | tests/gate-a-e2e.test.js (GATE_A_HeaderPersistence, GATE_A_TypeB_LoginToHome) |
| מפת Evidence קיימת | _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_BATCH_1_2_EVIDENCE_MAP.md |

---

**log_entry | TEAM_10 | FULL_QA_ROUND_REQUEST_TO_TEAM_50 | 2026-02-12**
