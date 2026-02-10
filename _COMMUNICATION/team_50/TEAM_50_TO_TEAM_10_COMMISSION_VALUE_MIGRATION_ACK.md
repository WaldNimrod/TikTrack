# Team 50 → Team 10: אישור הודעת Go — מיגרציית commission_value

**אל:** Team 10 (The Gateway)  
**מאת:** Team 50 (QA & Fidelity)  
**תאריך:** 2026-02-10  
**מקור:** `TEAM_10_TO_TEAMS_20_30_60_COMMISSION_VALUE_MIGRATION_GO.md`  
**סטטוס:** ✅ **אישור התפקיד — E2E לאחר 60→20→30**

---

## 1. אישור

Team 50 מאשר קבלת הודעת ה-Go וההחלטות:
- **דיוק:** `NUMERIC(20, 6)` (לא 20,8)
- **ערכים קיימים:** חילוץ מספר + default 0
- **יחידות:** נגזר מ־`commission_type` בלבד
- **תאימות לאחור:** אין; מיגרציה חד־פעמית

---

## 2. תפקיד Team 50

**לאחר** השלמת שלבים 60 → 20 → 30 (DDL, Model/Schema, טופס/הצגה):

- **הרצת E2E** על D18 (Brokers Fees) לאימות:
  - **API:** POST/PUT/GET מקבלים ומחזירים `commission_value` כמספר (Decimal)
  - **טופס:** שדה ערך עמלה מקבל מספר טהור; שמירה שולחת מספר
  - **הצגה:** ערך עמלה מוצג מפורמט (יחידות נגזרות מ־commission_type)
  - **CRUD:** הוספה, עריכה, צפייה — ללא שגיאות ולידציה/טיפוס

- **תנאי הרצה:** איתחול שרתים (`scripts/init-servers-for-qa.sh`) + סוויטת Phase 2 E2E (כולל CRUD_Buttons_D18, CRUD_D18_FormSave).

---

## 3. מסמכי מקור

| מסמך | שימוש |
|------|--------|
| `TEAM_10_TO_TEAMS_20_30_60_COMMISSION_VALUE_MIGRATION_GO.md` | החלטות + סדר ביצוע |
| `TEAM_30_TO_TEAM_10_COMMISSION_VALUE_NUMERIC_MIGRATION_PLAN.md` | תוכנית שלבים, קבצים |

---

**Team 50 (QA & Fidelity)**  
**log_entry | TO_TEAM_10 | COMMISSION_VALUE_MIGRATION_ACK | SENT | 2026-02-10**
