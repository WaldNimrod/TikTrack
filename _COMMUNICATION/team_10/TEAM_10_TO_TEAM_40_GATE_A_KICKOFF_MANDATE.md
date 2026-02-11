# 🚀 Team 10 → Team 40: הנעת עבודה עד שער א' — מנדט ביצוע

**מאת:** Team 10 (The Gateway)  
**אל:** Team 40 (Presentational / CSS)  
**תאריך:** 2026-01-30  
**סטטוס:** 📋 **מנדט להנעת תהליך — תיאום עם Team 30**  
**הקשר:** אישור התקדמות התקבל; סדר עבודה עד שער א'.

---

## 1. מטרת ההודעה

להנחות את Team 40 במשימות הרלוונטיות עד **שער א'**, בהתאם ל־**TT2_SLA_TEAMS_30_40** (40 = Presentational; 30 = Containers/Logic).

**מסמכי SSOT:**  
`ADR_STAGE0_BRIDGE_AND_REACT_TABLES_SSOT.md`, `TEAM_10_ORDER_OF_WORK_UNTIL_GATE_A.md`, `TEAM_10_VISUAL_GAPS_WORK_PLAN.md`.

---

## 2. משימות Team 40 עד שער א'

### 2.1 Header Path (שלב 0)

| # | פעולה | פרט |
|---|--------|------|
| 1 | **נעילה על נתיב Header** | SSOT: **`ui/src/views/shared/unified-header.html`** בלבד. |
| 2 | **תיעוד/תיקון** | וידוא שכל ההפניות (תיעוד, סגנונות, assets) מפנות לנתיב זה; הסרת הפניות ל־`ui/src/components/core/unified-header.html` אם קיימות. |
| 3 | **תיאום עם Team 30** | Team 30 מטפל ב־headerLoader.js; Team 40 מטפל בנתיבי תבנית ו־CSS/אסמבלי. |

### 2.2 User Icon — צבעים (שלב 1)

| # | פעולה | פרט |
|---|--------|------|
| 1 | **Success / Warning בלבד** | **Logged-in:** צבע success. **Logged-out:** צבע warning. |
| 2 | **איסור שחור** | אייקון User **לא** בשחור (black) — כל מופע = פגם. |
| 3 | **קבצים רלוונטיים** | `unified-header.html` ו/או `phoenix-header.css` — הסרת ברירת מחדל שחורה; שימוש במשתני CSS (success/warning). |
| 4 | **תיאום עם Team 30** | Team 30 מטפל בלוגיקת הצגה (logged-in/out); Team 40 מטפל במחלקות ו־tokens. |

**מקור:** `TEAM_10_VISUAL_GAPS_WORK_PLAN.md` §4.2; ADR SSOT §3.

### 2.3 משימות ויזואליות נוספות (אחרי שער א')

- משימות 3–6 בתוכנית (סדר כפתורים במודל, צבע כותרת מודל, תקנון כפתורים, דף צבעים) — **לא חוסמות** את שער א'.  
- **DNA_BUTTON_SYSTEM.md** — כבר הושלם במסגרת MAPPING_MODE.

---

## 3. סדר עבודה

- **עכשיו (שלב 0 + 1):** Header path + User Icon (Success/Warning, לא black).  
- **דיווח:** עם השלמה — דיווח ל־Team 10 ב־`_COMMUNICATION/team_40/`.

---

## 4. מסירת דיווח

קובץ דיווח ב־`_COMMUNICATION/team_40/` (למשל `TEAM_40_HEADER_AND_USER_ICON_COMPLETION.md`) — רשימת משימות שבוצעו וקבצים ששונו.

---

**Team 10 (The Gateway)**  
**log_entry | GATE_A_KICKOFF | TO_TEAM_40 | 2026-01-30**
