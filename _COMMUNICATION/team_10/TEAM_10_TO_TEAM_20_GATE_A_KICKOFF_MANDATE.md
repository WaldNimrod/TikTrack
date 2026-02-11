# 🚀 Team 10 → Team 20: הנעת עבודה עד שער א' — מנדט ביצוע

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Data / API)  
**תאריך:** 2026-01-30  
**סטטוס:** 📋 **מנדט להנעת תהליך — תיאום עם Team 30**  
**הקשר:** אישור התקדמות התקבל; סדר עבודה עד שער א'.

---

## 1. מטרת ההודעה

להנחות את Team 20 במשימות הרלוונטיות עד **שער א'**, בתיאום עם Team 30.

**מסמכי SSOT:**  
`ADR_STAGE0_BRIDGE_AND_REACT_TABLES_SSOT.md`, `TEAM_10_ORDER_OF_WORK_UNTIL_GATE_A.md`, `TEAM_10_VISUAL_GAPS_WORK_PLAN.md`.

---

## 2. משימות Team 20 עד שער א'

### 2.1 Admin-only (Type D) — מקור Role ב־JWT

| # | פעולה | פרט |
|---|--------|------|
| 1 | **JWT role** | וידוא ש־JWT מכיל שדה **`role`** שמזהה מנהל (admin). |
| 2 | **תיאום עם Team 30** | Team 30 מיישם בדיקת role ו־redirect/403 ל־`/admin/design-system`; Team 20 מספק/מאשר את מבנה ה־JWT והערכים התקפים. |
| 3 | **דיווח** | דיווח ל־Team 10 במידת השלמה או חסימה (למשל מסמך קצר על מבנה JWT ו־role). |

**Route:** `/admin/design-system` — Type D (Admin-only). מקור הרשאות: **JWT (שדה role)**.

### 2.2 Broker API (כבר במיפוי)

- **GET /api/v1/reference/brokers** — ADR‑013 LOCKED.  
- אם המיפוי והממשק כבר הושלמו ב־MAPPING_MODE — אין פעולה נדרשת בשלבים 0–2 לצורך שער א'.  
- אם נדרש עדכון — לתאם עם Team 30 (UI משתמש ב־API).

---

## 3. סדר עבודה כללי

- **שלב 0 (Bridge):** ללא משימה ישירה ל־Team 20.  
- **שלב 1 (אוטנטיקציה):** פריט 1.5 ב־ORDER — Admin-only; Team 20 + 30.  
- **שער א':** Team 50 מריץ בדיקות רק אחרי ש־Team 10 אישר השלמה ומסר קונטקסט.

---

## 4. מסירת דיווח

בהשלמת משימות JWT/role (או בחסימה): דיווח ל־Team 10 ב־`_COMMUNICATION/team_20/` (למשל `TEAM_20_ADMIN_JWT_ROLE_READINESS.md`).

---

**Team 10 (The Gateway)**  
**log_entry | GATE_A_KICKOFF | TO_TEAM_20 | 2026-01-30**
