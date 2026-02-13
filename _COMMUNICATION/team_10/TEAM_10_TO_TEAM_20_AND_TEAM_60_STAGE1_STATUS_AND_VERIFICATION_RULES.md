# Team 10 → Team 20 & Team 60: הודעה חוזרת — סטטוס Stage-1 ותאום + נוהל סגירה

**id:** `TEAM_10_TO_TEAM_20_AND_TEAM_60_STAGE1_STATUS_AND_VERIFICATION_RULES`  
**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend), Team 60 (DevOps & Platform)  
**date:** 2026-02-13  
**מקור:** דיווח Team 60 (TEAM_60_TO_TEAM_10_STAGE1_STATUS_REPORT.md) — תאום מלא ומדויק

---

## 1. סיכום דיווח Team 60 (לשני הצוותים)

### 1-004 Precision Audit
- **סטטוס ביצוע:** Team 60 הושלם.
- **Evidence:** `_COMMUNICATION/team_60/TEAM_60_STAGE1_1_004_PRECISION_AUDIT_EVIDENCE.md`
- **תוצאות:** 24 שדות NUMERIC נבדקו; 23 תואמי SSOT; סטייה אחת: `brokers_fees.minimum` (20,8 במקום 20,6) — לא קריטית.
- **סטטוס ברשימה המרכזית:** **PENDING_VERIFICATION** — סגירה רק לאחר אישור Team 90 (נוהל בדיקות).

### 1-002 MARKET_DATA_PIPE
- **סטטוס ביצוע:** תיאום Team 60–Team 20 הושלם; ביצוע מתוכנן 2026-02-23.
- **תיאום:** `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_20_STAGE1_1_002_COORDINATION.md`
- **תוכן:** ticker_prices קיים ותואם; exchange_rates לא קיים — DDL מתוכנן לאחר 1-001; Cache/EOD ממתין להחלטה ב-Spec הסופי.
- **סטטוס ברשימה המרכזית:** **IN_PROGRESS** — סגירה רק לאחר ביצוע תשתית + נוהל בדיקות.

---

## 2. תאום מלא — חובות הצוותים

### Team 20
- **1-001, 1-003:** Specs ב-SSOT; ממתינים לאימות/אישור (Team 90 או אדריכל) לפי נוהל — אין פעולה נדרשת עד להנחיה.
- **1-002:** לתאם עם Team 60 לפי הקובץ `TEAM_60_TO_TEAM_20_STAGE1_1_002_COORDINATION.md`; ביצוע תשתית (כולל exchange_rates DDL אם רלוונטי) — מתוכנן 2026-02-23.
- **1-004:** Evidence מ-20 ו-60 הוגשו; סגירה תתבצע רק לאחר אישור Team 90.

### Team 60
- **1-002:** ביצוע תשתית (Cache/EOD, DDL) — מתוכנן 2026-02-23; לדווח ל-Team 10 עם השלמה.
- **1-004:** Evidence הוגש; סטטוס PENDING_VERIFICATION עד אישור Team 90.

---

## 3. נוהל סגירה — חוקים ברורים (לשני הצוותים)

**כלל מחייב (נוהל רשימת המשימות המרכזית):**  
**אף משימה לא מסומנת CLOSED לפני שעבר נוהל בדיקה/אימות כנדרש.**

- **מסמכי Spec (1-001, 1-002 doc, 1-003):** CLOSED רק לאחר קידום ל-SSOT **ו-**אימות/אישור Team 90 או אדריכל (אם נדרש).
- **Evidence (1-004 Precision Audit):** CLOSED רק לאחר הגשת Evidence ל-Team 90 **ו-**אימות Team 60 (DB) **ו-**אישור Team 90.
- **ביצוע תשתית (1-002):** CLOSED רק לאחר יישום **ו-**בדיקה לפי נוהל רלוונטי (QA/Spy).

**סטטוסים ביניים:** IN_PROGRESS או **PENDING_VERIFICATION** — עד להשלמת נוהל הבדיקות.  
Team 10 מעדכן את הרשימה המרכזית בלבד; עדכון סטטוס ל-CLOSED יבוצע רק לאחר עמידה בנוהל לעיל.

---

## 4. קבצים רלוונטיים

| קובץ | תיאור |
|------|--------|
| TEAM_60_TO_TEAM_10_STAGE1_STATUS_REPORT.md | דיווח Team 60 ל-Team 10 |
| TEAM_60_STAGE1_1_004_PRECISION_AUDIT_EVIDENCE.md | Evidence Precision Audit (Team 60) |
| TEAM_60_TO_TEAM_20_STAGE1_1_002_COORDINATION.md | תיאום 1-002 Team 60 ↔ Team 20 |
| TEAM_10_MASTER_TASK_LIST.md | רשימת משימות — סטטוסים מעודכנים |
| TEAM_10_MASTER_TASK_LIST_PROTOCOL.md | נוהל — כלל 6 (סגירה רק לאחר נוהל בדיקות) |

---

## 5. בקשת תאום

- **Team 20:** לאשר קבלת הודעה זו; לתאם עם Team 60 על 1-002 לפי הקובץ המצוין; לדווח ל-Team 10 עם השלמת ביצוע או חסימות.
- **Team 60:** לאשר קבלת הודעה זו; להמשיך לפי תאריכים (ביצוע 2026-02-23); לדווח ל-Team 10 עם השלמה.

**log_entry | TEAM_10 | TO_TEAM_20_AND_60 | STAGE1_STATUS_VERIFICATION_RULES | 2026-02-13**
