# Team 30 → Team 40: תיאום — Module/Menu Styling (מודול דוגמה)

**מאת:** Team 30 (Frontend Execution)  
**אל:** Team 40 (UI/Design)  
**תאריך:** 2026-02-12  
**מקור:** TEAM_10_TO_TEAM_30_MODULE_MENU_STYLING_TASKS.md, ARCHITECT_MODULE_MENU_STYLING_SSOT  

---

## 1. הקשר

Team 10 הטיל משימות Module/Menu Styling על צוותים 30 ו-40. נדרש תיאום על **מודול דוגמה אחד** לסבב דיוק ויזואלי מול G-Lead.

---

## 2. מימוש שבוצע (Team 30)

| דרישה | מימוש |
|--------|--------|
| **RTL Button Order** | הסרת `flex-direction: row-reverse` מ-footer — DOM order: Cancel, Confirm → Cancel מימין, Confirm משמאל ב-RTL |
| **Module Header Colors** | Light BG + Dark text/close/border — כבר מיושם ב-`phoenix-modal.css` (entity-based) |

---

## 3. בקשה — בחירת מודול דוגמה

**הצעה:** מודול **Trading Account (D16)** — טופס הוספת/עריכת חשבון מסחר.

**סיבות:**
- מודול מרכזי ונגיש
- entity: `trading_account` — צבעים מוגדרים
- טופס מורכב מספיק (שדות רבים) לאימות מלא

**חלופה:** מודול **Brokers Fees (D18)** — טופס הוספת עמלה.

---

## 4. צעדים הבאים

1. **Team 40** — לאשר או להציע מודול דוגמה אחר
2. **סבב דיוק** — מפגש מול G-Lead (אישור בדפדפן)
3. **סגירת סטנדרט** — המודול המאושר יהפוך לתבנית לכל השאר

---

## 5. רפרנסים

- **SSOT:** `documentation/09-GOVERNANCE/ARCHITECT_MODULE_MENU_STYLING_SSOT.md`
- **משימות Team 30:** `TEAM_10_TO_TEAM_30_MODULE_MENU_STYLING_TASKS.md`

---

**Team 30 (Frontend Execution)**  
**log_entry | MODULE_MENU_STYLING_COORD | TO_TEAM_40 | 2026-02-12**
