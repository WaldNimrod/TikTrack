# ADR-015 — חבילת הפצה להנעת התהליך (אופטימלי)

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**מטרה:** אילו קבצים להעביר לכל צוות כדי להניע ביצוע באופן אופטימלי.

---

## 1. Team 20 (Backend)

**מנדט ראשי + SSOT — להעביר עכשיו:**

| # | קובץ | סיבה |
|---|------|------|
| 1 | **TEAM_10_TO_TEAM_20_ADR_015_BROKER_REFERENCE_MANDATE.md** | מנדט מלא: endpoint, DB/API, מיגרציה (§2.3), תוצר מצופה. |
| 2 | **TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md** | תוכנית עבודה — §6א מיגרציה מפורט, סדר ביצוע, יישור 20↔60. |
| 3 | **documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql** | SSOT DDL — טבלת `user_data.brokers_fees` (trading_account_id, commission_value NUMERIC(20,6), ללא broker). |
| 4 | **_COMMUNICATION/team_10/TEAM_10_COMMISSION_VALUE_NUMERIC_DECISIONS.md** | SSOT להחלטת commission_value NUMERIC(20,6) ומיגרציה מערך. |

**אופציונלי (הקשר):** ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md — עקרונות נעולים, Acceptance Criteria.

---

## 2. Team 30 (Frontend)

**מנדט ראשי + SSOT — להעביר עכשיו:**

| # | קובץ | סיבה |
|---|------|------|
| 1 | **TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md** | מנדט מלא: D16 "אחר" + הודעה, D18 בחירת חשבון + עמלות, SLA 30/40. |
| 2 | **TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md** | תוכנית עבודה — סדר ביצוע, §4 הודעת משילות, §8 "אחר" מה-API. |
| 3 | **documentation/06-ENGINEERING/ADR_015_GOVERNANCE_MESSAGE_SSOT.md** | טקסט הודעת המשילות + ערך `primary_admin_contact` (אין placeholder). |
| 4 | **ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md** | §8 "אחר" (value "other", is_supported false), §6 Acceptance Criteria. |

**אופציונלי:** ADR_015_READY_FOR_DISTRIBUTION.md — הוכחת SSOT אם צוות מבקש.

---

## 3. Team 60 (DevOps)

**הנחיה קצרה — להעביר עכשיו:**

| # | קובץ | סיבה |
|---|------|------|
| 1 | **TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md** | §0 (יישור 20↔60), §3 שלב 2א, §6א — תפקידכם: **הרצת** סקריפט המיגרציה בסביבה לפי הנחיית Team 20 (לא כתיבת לוגיקת המיגרציה). |

**הנחיה בקצרה:** לאחר ש-Team 20 ימסור סקריפט מיגרציה מוכן — להריץ בסביבה (למשל `make db-*` / pipeline) לפי נוהל. אין צורך במנדט נפרד; התוכנית מגדירה את התפקיד.

---

## 4. סיכום — מינימום להנעה

| צוות | חובה (להעביר) | אופציונלי |
|------|----------------|-----------|
| **20** | מנדט 20 + תוכנית עבודה + DDL + TEAM_10_COMMISSION_VALUE_NUMERIC_DECISIONS | ADR_015_FINAL |
| **30** | מנדט 30 + תוכנית עבודה + ADR_015_GOVERNANCE_MESSAGE_SSOT + ADR_015_FINAL | READY_FOR_DISTRIBUTION |
| **60** | תוכנית עבודה (§0, §3 שלב 2א, §6א) | — |

---

## 5. נתיבים (להעתקה)

```
_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_ADR_015_BROKER_REFERENCE_MANDATE.md
_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md
_COMMUNICATION/team_10/TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md
_COMMUNICATION/team_10/ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md
_COMMUNICATION/team_10/TEAM_10_COMMISSION_VALUE_NUMERIC_DECISIONS.md
_COMMUNICATION/team_10/ADR_015_READY_FOR_DISTRIBUTION.md
documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql
documentation/06-ENGINEERING/ADR_015_GOVERNANCE_MESSAGE_SSOT.md
```

---

**Team 10 (The Gateway)**  
**log_entry | ADR_015 | DISTRIBUTION_PACKAGE_CREATED | 2026-02-12**
