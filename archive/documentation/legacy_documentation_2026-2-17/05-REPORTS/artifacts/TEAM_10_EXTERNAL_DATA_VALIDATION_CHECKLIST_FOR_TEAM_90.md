# צ'קליסט ולידציה — External Data Automated Testing (מול Team 90)

**מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_VALIDATION_REVIEW  
**תאריך:** 2026-02-13

---

## מכשולים שצוינו — סטטוס

| # | מכשול | תיקון נדרש | סטטוס |
|---|--------|------------|--------|
| **1** | Evidence לא עדכני (לוגים 2026-01-31, קבצים 2026-02-14) | הרצה מחדש Smoke + Nightly; עדכון Evidence logs בתאריך ובתוצאות עדכניים | ⏳ **תלוי בהרצה** — יש להריץ `run-smoke-external-data.sh` ו־`run-nightly-external-data.sh` ולתעד תאריך + פלט ב־TEAM_10 / TEAM_50 Evidence logs. |
| **2** | כפילות Suite E (שני קבצים) | קובץ קנוני אחד; ארכוב/הסרת כפיל; עדכון references | ✅ **בוצע** — קנוני: `tests/external-data-suite-e-staleness-clock.e2e.test.js`. הכפיל הועבר ל־99-ARCHIVE/tests/. `run-external-data-nightly.js` ו־`npm run test:external-data-suite-e` מצביעים לקנוני. |
| **3** | Suite C — Evidence ל־ticker_prices_intraday | Evidence שהטבלה קיימת ב-DB (DDL או פלט בדיקה) | ✅ **Evidence מסמך** — DDL: `scripts/migrations/p3_016_create_ticker_prices_intraday.sql`. מסמך: `documentation/05-REPORTS/artifacts/TEAM_20_60_TICKER_PRICES_INTRADAY_EVIDENCE.md` (כולל שאילתת וידוא). אם ה-DB עדיין לא הריץ את ה-migration — Team 20/60 להריץ ו/או לצרף פלט בדיקה. |

---

## סיכום — האם הביקורת תעבור?

- **מכשול 2 ו-3:** טופלו (כפיל הוסר, Evidence ל-intraday קיים).  
- **מכשול 1:** הביקורת תעבור **רק אחרי** הרצה מחדש של Smoke + Nightly ועדכון Evidence logs בתאריך העדכני ובתוצאות הריצה. בלי זה Team 90 עלולים להשאיר "evidence freshness" כ־לא מאושר.

**פעולה אחרונה נדרשת:**  
להריץ מהשורש של הפרויקט:

```bash
bash scripts/run-smoke-external-data.sh
bash scripts/run-nightly-external-data.sh
```

לאחר מכן לעדכן ב־`TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE_LOG.md` ו־`TEAM_50_EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE_LOG.md` (ובמסמכי Team 50) את **תאריך הריצה** ו-**תוצאות** (PASS/FAIL + סיכום אם רלוונטי).

---

**log_entry | TEAM_10 | EXTERNAL_DATA_VALIDATION_CHECKLIST | 2026-02-13**
