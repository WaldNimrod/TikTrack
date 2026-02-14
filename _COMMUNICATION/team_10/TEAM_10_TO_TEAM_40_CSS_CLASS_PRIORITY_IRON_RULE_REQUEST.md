# Team 10 → Team 40: בקשת תיאום — כלל ברזל עדיפות מחלקות CSS

**id:** `TEAM_10_TO_TEAM_40_CSS_CLASS_PRIORITY_IRON_RULE_REQUEST`  
**from:** Team 10 (The Gateway)  
**to:** Team 40 (UI Assets & Design)  
**re:** TEAM_30_CSS_CLASS_PRIORITY_IRON_RULE_PROPOSAL — קידום לנוהל  
**date:** 2026-02-14

---

## 1. הקשר

Team 30 הגיש הצעה לכלל ברזל — **סדר עדיפויות במחלקות CSS**. Team 10 קידם את ההצעה לנוהל מחייב (ראה §2).  
**בקשת Team 10:** לאשר/לעדכן את **TEAM_40_VISUAL_VALIDATION_CRITERIA** כך שיתיישב עם הכלל ויכלול את שלושת השלבים.

---

## 2. כלל ברזל (מקודם ב-SSOT)

**מקור מחייב:** `documentation/05-PROCEDURES/TEAM_30_FRONTEND_STANDARDS_QA_PROCEDURE.md` §1.5  
**מקור הצעה:** _COMMUNICATION/team_30/TEAM_30_CSS_CLASS_PRIORITY_IRON_RULE_PROPOSAL.md

| עדיפות | פעולה |
|--------|-------|
| **1** | מחלקות ברירת מחדל או ללא מחלקה — העיצוב מ־phoenix-base / element selectors |
| **2** | מחלקה **קיימת** כבר בשימוש בממשקים אחרים (index-section__*, phoenix-table-*, form-group וכו') |
| **3** | מחלקה **חדשה** — רק במידת הצורך; **חובה** לבדוק ב־CSS_CLASSES_INDEX ובקוד לפני יצירה |

---

## 3. בקשת עדכון ל-Team 40

- **לאשר** את כלל הברזל (שלושת השלבים) כחלק מקריטריוני הבדיקה.
- **לעדכן** את TEAM_40_VISUAL_VALIDATION_CRITERIA — סעיף הרלוונטי (כיום: "בדיקה ב-CSS_CLASSES_INDEX לפני יצירת מחלקה חדשה") — כך שיכלול במפורש:
  - עדיפות 1: default / no class  
  - עדיפות 2: שימוש במחלקה קיימת (כולל CSS_CLASSES_INDEX)  
  - עדיפות 3: מחלקה חדשה רק כשנדרש, אחרי בדיקה ב-CSS_CLASSES_INDEX  

תוצר מצופה: גרסה מעודכנת של TEAM_40_VISUAL_VALIDATION_CRITERIA (ב-_COMMUNICATION/team_40/) עם הפניה ל־TEAM_30_FRONTEND_STANDARDS_QA_PROCEDURE §1.5.

---

## 4. הפניות

- **נוהל SSOT:** documentation/05-PROCEDURES/TEAM_30_FRONTEND_STANDARDS_QA_PROCEDURE.md (§1.5)  
- **הצעת Team 30:** _COMMUNICATION/team_30/TEAM_30_CSS_CLASS_PRIORITY_IRON_RULE_PROPOSAL.md  
- **קריטריונים נוכחיים:** _COMMUNICATION/team_40/TEAM_40_VISUAL_VALIDATION_CRITERIA.md  

---

**log_entry | TEAM_10 | TO_TEAM_40 | CSS_CLASS_PRIORITY_IRON_RULE_REQUEST | 2026-02-14**
