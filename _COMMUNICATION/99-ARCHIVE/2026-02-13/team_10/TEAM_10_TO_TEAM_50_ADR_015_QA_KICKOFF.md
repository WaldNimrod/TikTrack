# Team 10 → Team 50: מסירת קונטקסט — QA ADR-015 (שער א')

**מאת:** Team 10 (The Gateway)  
**אל:** Team 50 (QA & Fidelity)  
**תאריך:** 2026-02-12  
**נושא:** קונטקסט מלא לביצוע QA (שער א') — סבב ADR-015  
**נוהל:** TT2_QUALITY_ASSURANCE_GATE_PROTOCOL §1ב — מסירת קונטקסט מפורט חובה לפני הפעלת QA.

---

## 1. מה פותח (תוכנית / שלב)

**תוכנית:** ADR-015 — מנדט רפרנס ברוקרים ועמלות לפי חשבון מסחר (Fees per Trading Account).

**מה הושלם:**

| צוות | משימה | סטטוס |
|------|--------|--------|
| **Team 20** | הרחבת GET /reference/brokers (display_name, is_supported, default_fees, "other"); DB/API עמלות לפי חשבון (trading_account_id); מיגרציה. | ✅ דוח השלמה נמסר |
| **Team 60** | גיבוי DB, הרצת סקריפט מיגרציה, אימות. | ✅ מיגרציה הושלמה (3 שורות עודכנו, 14 נמחקו ללא התאמה) |
| **Team 30** | D16: "אחר" + הודעת משילות (בחירת ברוקר); D18: בחירת חשבון מסחר + עמלות לפי חשבון (trading_account_id). | ✅ מומש; Build עבר (110 מודולים); בדיקה ראשונית בוצעה |

**תוצר ביניים:** דוחות השלמה/אימות מכל הצוותים; Evidence ב-`05-REPORTS/artifacts/TEAM_10_ADR_015_BROKER_REFERENCE_EVIDENCE_LOG.md`.

---

## 2. מה נדרש לבדוק (Scope)

### 2.1 עמודים ותזרים

| פריט | תיאור |
|------|--------|
| **D16 (חשבונות מסחר)** | טופס הוספת/עריכת חשבון: בחירת ברוקר "אחר" → הצגת הודעת המשילות (טקסט + קישור מ-SSOT); שדה שם ברוקר ידני; שמירה. |
| **D18 (עמלות לכל חשבון)** | בחירת חשבון מסחר (selector); טעינת עמלות לפי trading_account_id; הוספת עמלה (POST עם trading_account_id); עריכת עמלה (PUT); תצוגת "חשבון מסחר" בטבלה. |
| **API** | GET /api/v1/reference/brokers — מבנה חדש (display_name, is_supported, default_fees); פריט "other" עם is_supported: false. GET/POST/PUT /api/v1/brokers_fees — trading_account_id בחובה. |

### 2.2 שערים רלוונטיים

| שער | רלוונטי | הערה |
|-----|---------|------|
| **שער א'** | ✅ כן | הרצת סוויטת הבדיקות האוטומטיות; Integration; Runtime (Selenium); E2E — D16/D18 בהתאם ל-TEAM_50_QA_WORKFLOW_PROTOCOL. |
| **שער ב'** | אחרי שער א' | צוות 90 — לאחר GATE_A_PASSED. |
| **שער ג'** | אחרי שער ב' | Visionary — אישור ויזואלי סופי. |

### 2.3 Acceptance Criteria (ADR-015) — לאימות ב-QA

- D18 מציג עמלות **לפי חשבון מסחר בלבד** (בחירת חשבון + עמלות של החשבון).
- בכל פעולה של עמלה יש **trading_account_id** (ב-API).
- "Other broker" והודעת המשילות — **ב-D16 בלבד**.
- Build עבר — אין שגיאות קומפילציה (אומת על ידי Team 30).

---

## 3. קונטקסט (SSOT, Endpoints, הנחיות)

### 3.1 מסמכי SSOT

| מסמך | נתיב |
|------|------|
| תוכנית עבודה ADR-015 | _COMMUNICATION/team_10/TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md |
| מנדט סופי (עקרונות, Acceptance Criteria) | _COMMUNICATION/team_10/ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md |
| Evidence Log | 05-REPORTS/artifacts/TEAM_10_ADR_015_BROKER_REFERENCE_EVIDENCE_LOG.md |
| הודעת משילות (טקסט/קישור) | documentation/06-ENGINEERING/ADR_015_GOVERNANCE_MESSAGE_SSOT.md |
| נוהל QA | documentation/05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md |
| נוהל Team 50 | documentation/09-GOVERNANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md |

### 3.2 דוחות צוותים (להקשר)

| צוות | מסמך |
|------|------|
| Team 20 | documentation/05-REPORTS/artifacts_SESSION_01/TEAM_20_ADR_015_COMPLETION_REPORT.md |
| Team 60 | _COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_ADR_015_MIGRATION_COMPLETE.md |
| Team 30 | _COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_ADR_015_VERIFICATION_REPORT.md |
| Team 30 (Evidence קצר) | documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_ADR_015_INITIAL_VERIFICATION_REPORT.md |

### 3.3 Endpoints / פורטים

- **Frontend:** 8080 (או לפי תצורת הפרויקט).
- **Backend API:** 8082 (או לפי .env).
- **Reference brokers:** GET /api/v1/reference/brokers.
- **Brokers fees:** GET/POST/PUT /api/v1/brokers_fees; GET /api/v1/brokers_fees/summary (פילטר trading_account_id).

### 3.4 הנחיות

- **E2E:** אימות תזרים D16 (בחירת "אחר" → הודעה → שמירה) ותזרים D18 (בחירת חשבון → טעינת עמלות → הוספה/עריכה) — per המלצות Team 30 בדוח ההתאמה.
- **תקלות:** דיווח לפי TT2_TEAM_50_DEFECT_REPORTING_PROCEDURE — עדכון ל-Team 10 + דרישת תיקון מפורטת לצוות הרלוונטי.
- **תוצר שער א':** דוח סיכום המאשר מעבר חלק (0 SEVERE); סטטוס GATE_A_PASSED.

---

## 4. מיקום ומסמך זה

**מיקום:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_ADR_015_QA_KICKOFF.md`  
**תפקיד:** מסירת קונטקסט חובה per TT2_QUALITY_ASSURANCE_GATE_PROTOCOL §1ב. עם קבלת מסמך זה — **מותר להתחיל ביצוע QA (שער א')** לפי TEAM_50_QA_WORKFLOW_PROTOCOL.

---

**Team 10 (The Gateway)**  
**log_entry | ADR_015 | QA_KICKOFF_TO_TEAM_50 | 2026-02-12**
