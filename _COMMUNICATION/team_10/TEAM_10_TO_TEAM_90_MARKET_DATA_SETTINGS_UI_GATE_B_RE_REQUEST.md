# Team 10 → Team 90 | בקשה חוזרת ל-Gate-B — Market Data Settings UI (MD-SETTINGS)

**from:** Team 10 (The Gateway)  
**to:** Team 90 / Spy verification  
**date:** 2026-02-15  
**subject:** דרישות סגירה הושלמו — בקשה חוזרת לאימות Gate-B (MD-SETTINGS)

---

## סיכום

**משימה:** MD-SETTINGS (Market Data Settings UI)  
**הקשר:** Gate-B נדחה (BLOCKED); כל דרישות הסגירה הושלמו. **מבקשים אימות Gate-B חוזר.**

**Evidence 403 (נתיבים):** _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_MD_SETTINGS_403_EVIDENCE.md | documentation/05-REPORTS/artifacts/MD_SETTINGS_403_EVIDENCE_20260215_220242.log

---

## השלמת דרישות סגירה

| # | דרישה | סטטוס |
|---|--------|--------|
| 1 | בדיקת 403 אמיתית עם משתמש non-admin + Evidence | ✅ **בוצע** — משתמש qa_nonadmin (USER); GET /settings/market-data → 403 Forbidden; PATCH /settings/market-data → 403 Forbidden. Evidence: _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_MD_SETTINGS_403_EVIDENCE.md; לוג: documentation/05-REPORTS/artifacts/MD_SETTINGS_403_EVIDENCE_20260215_220242.log; סקריפט: scripts/run-md-settings-403-evidence.sh. |
| 2 | עדכון OpenAPI למסלולי GET/PATCH /settings/market-data | ✅ בוצע (OPENAPI_SPEC_V2.5.2_MARKET_DATA_SETTINGS_ADDENDUM.yaml) |
| 3 | נעילת סטטוס SSOT מ-DRAFT ל-LOCKED | ✅ בוצע (TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.md) |
| 4 | יישור חוזה שגיאות (422/403) בין מסמכים לקוד | ✅ בוצע |

---

## Evidence 403 — תוצרים

| קובץ | תיאור |
|------|--------|
| _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_MD_SETTINGS_403_EVIDENCE.md | מסמך Evidence ל-Team 10 |
| documentation/05-REPORTS/artifacts/MD_SETTINGS_403_EVIDENCE_20260215_220242.log | לוג הרצה |
| scripts/run-md-settings-403-evidence.sh | סקריפט להרצה חוזרת |
| scripts/seed_nonadmin_for_403.py, scripts/seed_nonadmin_for_403.sql | seed משתמש qa_nonadmin / qa403test (role USER) |

---

## בקשת Gate-B חוזר

מבקשים אימות Spy (Gate-B) חוזר למשימת MD-SETTINGS. לאחר אישור Gate-B — מעבר ל-Gate-KP (Knowledge Promotion) וסגירה עם Seal (SOP-013).

---

**log_entry | TEAM_10 | TO_TEAM_90 | MD_SETTINGS_GATE_B_RE_REQUEST | 2026-02-15**
