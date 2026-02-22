# Gate-B MD-SETTINGS — BLOCKED + דרישות סגירה לפני Gate-B חוזר
**project_domain:** TIKTRACK

**משימה:** MD-SETTINGS  
**פסק דין:** לא לאשר Gate-B עדיין (BLOCKED)  
**תאריך:** 2026-02-15  
**מקור:** בדיקת Spy (Team 90)

---

## ממצאים חוסמים (תוקנו / נדרש)

| ממצא | חומרה | סטטוס תיקון |
|------|--------|--------------|
| **[P1]** קריטריון 403 למשתמש non-admin לא אומת בפועל, אך דווח 100% PASS | P1 | ✅ תוקן: בדיקת 403 אמיתית בוצעה (משתמש qa_nonadmin / USER). GET + PATCH → 403 Forbidden. Evidence: _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_MD_SETTINGS_403_EVIDENCE.md, documentation/05-REPORTS/artifacts/MD_SETTINGS_403_EVIDENCE_*.log, scripts/run-md-settings-403-evidence.sh. |
| **[P1]** חוזה OpenAPI לא עודכן — אין מסלול /settings/market-data | P1 | ✅ תוקן: נוצר **OPENAPI_SPEC_V2.5.2_MARKET_DATA_SETTINGS_ADDENDUM.yaml** — GET+PATCH, 403, 422. |
| **[P2]** סטטוס SSOT נשאר DRAFT | P2 | ✅ תוקן: **TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.md** — סטטוס עודכן ל-**LOCKED** (עם הפניה לאישור אדריכלית). |
| **[P2]** אי-יישור חוזה שגיאות (400 vs 422) בין מסמכים לקוד | P2 | ✅ תוקן: יושר ל-**422** (validation) + **403** (non-admin). SSOT, מנדט 20, Work Plan, docstring ב-settings.py — עודכנו. |

---

## דרישות סגירה לפני Gate-B חוזר

1. ~~להריץ בדיקת 403 עם משתמש non-admin (USER פעיל) ולצרף Evidence~~ — **בוצע** (Team 50: qa_nonadmin, GET+PATCH → 403; Evidence + לוג + סקריפט).
2. ~~לעדכן OpenAPI למסלולי GET/PATCH /settings/market-data~~ — **בוצע** (addendum).
3. ~~לנעול סטטוס SSOT מ-DRAFT ל-LOCKED~~ — **בוצע**.
4. ~~ליישר חוזה שגיאות (422/403)~~ — **בוצע**.

**כל דרישות הסגירה הושלמו.** ניתן להגיש Gate-B חוזר ל-Team 90.

---

## מה כן תקין (אושר ב-Spy)

- Admin-only נאכף ב-GET/PATCH (require_admin_role).
- intraday_enabled נאכף ב-runtime (sync_ticker_prices_intraday.py).
- DDL לטבלת settings קיים (PHX_DB_SCHEMA_V2.5_MARKET_DATA_SYSTEM_SETTINGS_DDL.sql).

---

**log_entry | TEAM_10 | GATE_B | MD_SETTINGS_403_EVIDENCE_RECEIVED | 2026-02-15** — Evidence 403 התקבל מ-Team 50. משתמש qa_nonadmin (USER); GET + PATCH → 403 ✓. כל 4 דרישות סגירה הושלמו. הגשה חוזרת: TEAM_10_TO_TEAM_90_MARKET_DATA_SETTINGS_UI_GATE_B_RE_REQUEST.md.

**log_entry | TEAM_10 | GATE_B | MD_SETTINGS_BLOCKED_CLOSURE_REQUIREMENTS | 2026-02-15**
