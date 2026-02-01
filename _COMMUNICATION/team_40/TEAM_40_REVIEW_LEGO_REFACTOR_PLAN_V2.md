# 📋 ריביו תוכנית LEGO Refactor V2 | Team 40

**From:** Team 40 (UI Assets & Design)  
**To:** Team 10 (The Gateway)  
**Date:** 2026-02-01  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** REVIEW_LEGO_REFACTOR_PLAN_V2 | Status: 🟡 **REVIEW COMPLETE - QUESTIONS & CLARIFICATIONS**

---

## ✅ אישור כללי

**תוכנית:** ✅ ברורה ומפורטת  
**ארכיטקטורה:** ✅ מתיישבת עם LEGO System  
**שלבים:** ✅ לוגיים ומסודרים

---

## 🔍 הערות ושאלות מפורטות

### **1. סטטוס שלב 2 - היררכיית CSS** ⚠️ **דורש הבהרה**

**בתוכנית נכתב:**
> "**סטטוס:** ✅ Audit Complete, ✅ Approved, ⏳ In Progress"

**מצב נוכחי:**
- ✅ Audit Complete (Task 2.1 & 2.2) - הושלם
- 🟡 Approval - **ממתין לאישור** על השאלות ב-`TEAM_40_TO_TEAM_10_CSS_AUDIT_FINDINGS.md`
- ⏸️ In Progress - **לא התחלתי** עדיין כי ממתין לאישור

**שאלות:**
1. האם האישור על התיקונים כבר ניתן? (לא ראיתי תשובה על השאלות שלי)
2. האם להמשיך למשימה 2.3 (תיקון היררכיה) או להמתין לאישור מפורש?
3. האם יש עדכון על השאלות ששאלתי ב-`TEAM_40_TO_TEAM_10_CSS_AUDIT_FINDINGS.md`?

**המלצה:**
- עדכן את הסטטוס ל-"🟡 Awaiting Approval" או "✅ Approved" בהתאם למצב
- או תן תשובה מפורשת על השאלות

---

### **2. Design Tokens - מה קורה איתם?** ⚠️ **דורש הבהרה**

**רקע:**
- יצרתי `ui/design-tokens/auth.json` ו-`ui/design-tokens/forms.json` במשימה 40.1.1
- יצרתי `ui/styles/design-tokens.css` (שצריך להסיר לפי ה-Audit)

**בתוכנית:**
- לא מוזכר מה קורה עם קבצי ה-JSON של Design Tokens
- רק מוזכר CSS Variables ב-`phoenix-base.css`

**שאלות:**
1. האם קבצי ה-JSON (`design-tokens/*.json`) נשארים או מוסרים?
2. האם Design Tokens נשארים רק ב-CSS Variables או גם ב-JSON?
3. האם יש צורך ב-Design Tokens JSON עבור Cube Components Library?

**המלצה:**
- להחליט אם Design Tokens JSON נשארים (לשימוש עתידי/תיעוד)
- או להסיר אותם אם לא נדרשים

---

### **3. שלב 2.5 - Cube Components Library** ⚠️ **דורש הבהרה**

**בתוכנית:**
> "יצירת Cube Components Library" - שלב חדש

**שאלות:**
1. **תיאום עם Team 30:**
   - מתי מתחיל התיאום? (לפני או אחרי השלמת שלב 2?)
   - מי מוביל את התהליך? (Team 30 או Team 40?)
   - איך מתבצע התיאום? (יש מפגש/תיאום מתוכנן?)

2. **תפקיד Team 40 בשלב זה:**
   - מה בדיוק התפקיד שלי? ("ולידציה ויזואלית" - מה זה כולל?)
   - האם אני צריך ליצור Design Tokens/Components או רק לבדוק?
   - האם יש דוגמאות/תבניות שצריך לעקוב אחריהן?

3. **תוצר:**
   - מה התוצר הסופי של שלב זה?
   - איך נדע שהשלב הושלם?

**המלצה:**
- להוסיף פירוט על תהליך התיאום בין Team 30 ו-Team 40
- להבהיר מה התוצר הצפוי מכל צוות

---

### **4. שלב 3.5 - ארגון סקריפטים חיצוניים** ⚠️ **כלל ברזל חדש**

**בתוכנית:**
> "**כלל ברזל:** אין סקריפטים בתוך העמוד"

**שאלות:**
1. **השפעה על עבודה קיימת:**
   - האם זה חל גם על עמודים קיימים? (D15_LOGIN, D15_REGISTER, וכו')
   - האם צריך לעבור על כל העמודים הקיימים ולהסיר סקריפטים?

2. **תיאום עם Team 30:**
   - האם Team 30 אחראי על זה? (נראה שכן לפי התוכנית)
   - האם Team 40 צריך לעשות משהו בנושא זה?

3. **Design Tokens/Components:**
   - האם Components שיוצרים בשלב 2.5 יכולים להכיל סקריפטים פנימיים?
   - או שגם Components חייבים להשתמש בסקריפטים חיצוניים?

**המלצה:**
- להבהיר אם זה חל על עבודה קיימת או רק על עבודה חדשה
- להבהיר את תפקיד Team 40 בנושא זה

---

### **5. תפקיד Team 40 - פירוט** ⚠️ **דורש הבהרה**

**בתוכנית נכתב:**
> "**אחריות:**
> - תיקון היררכיית CSS (שלב 2)
> - עבודה עם Team 30 על יצירת Cube Components Library
> - ולידציה ויזואלית של Components משותפים"

**שאלות:**
1. **ולידציה ויזואלית:**
   - מה זה כולל בדיוק? (בדיקת fidelity? בדיקת עמידה ב-Design Tokens?)
   - מתי זה מתבצע? (במהלך יצירה או אחרי?)
   - מה הקריטריונים?

2. **עבודה עם Team 30:**
   - מה התהליך? (יש מפגשים? תקשורת דרך Team 10?)
   - מי מוביל? (Team 30 או Team 40?)

3. **תוצר:**
   - מה התוצר הצפוי מ-Team 40 בשלב 2.5?
   - האם יש מסמכים/תיעוד שצריך ליצור?

**המלצה:**
- להוסיף פירוט על תהליך הולידציה היזואלית
- להבהיר את תהליך התיאום עם Team 30

---

### **6. Design Tokens ו-CSS Variables - סתירה?** ⚠️ **דורש הבהרה**

**רקע:**
- יצרתי Design Tokens JSON במשימה 40.1.1
- ב-Audit זיהיתי כפילות ב-CSS Variables
- התוכנית לא מזכירה Design Tokens JSON

**שאלות:**
1. **Design Tokens JSON:**
   - האם הם נשארים לשימוש עתידי?
   - או שהם רק היו שלב ביניים ועכשיו הכל ב-CSS Variables?

2. **Cube Components Library:**
   - האם Components ישתמשו ב-Design Tokens JSON או רק ב-CSS Variables?
   - האם יש צורך ב-Design Tokens JSON עבור Components?

**המלצה:**
- להחליט על אסטרטגיית Design Tokens (JSON vs CSS Variables)
- להבהיר איך Components ישתמשו ב-Design Tokens

---

### **7. שלב 2.4 - עדכון CSS_CLASSES_INDEX.md** ⚠️ **לא מוזכר בתוכנית**

**בתוכנית המקורית (CSS_BLUEPRINT_REFACTOR_PLAN):**
- שלב 2.4: עדכון `CSS_CLASSES_INDEX.md`

**בתוכנית החדשה:**
- לא מוזכר שלב 2.4

**שאלות:**
1. האם שלב 2.4 בוטל או נכלל בשלב אחר?
2. האם עדיין צריך לעדכן את `CSS_CLASSES_INDEX.md`?
3. אם כן, מתי זה צריך להתבצע?

**המלצה:**
- להבהיר מה קורה עם שלב 2.4
- או להוסיף אותו חזרה לתוכנית

---

### **8. תיאום בין שלבים** ⚠️ **דורש הבהרה**

**בתוכנית:**
- שלב 2: Team 40
- שלב 2.5: Team 30 + Team 40
- שלב 3: Team 30 + Team 40

**שאלות:**
1. **תלות בין שלבים:**
   - האם שלב 2.5 יכול להתחיל לפני השלמת שלב 2?
   - או שחייב להמתין להשלמת שלב 2?

2. **תיאום:**
   - איך מתבצע התיאום בין Team 30 ו-Team 40?
   - האם יש מפגש/תיאום מתוכנן?

**המלצה:**
- להבהיר את התלויות בין שלבים
- להבהיר את תהליך התיאום

---

## ✅ נקודות חיוביות

1. **ארכיטקטורה ברורה:** ✅ LEGO System מוגדר היטב
2. **שלבים לוגיים:** ✅ סדר העבודה הגיוני
3. **תפקידים ברורים:** ✅ כל צוות יודע מה התפקיד שלו
4. **כללי ברזל:** ✅ כלל על סקריפטים חיצוניים ברור

---

## 📋 סיכום שאלות קריטיות

### **דורש תשובה לפני המשך:**

1. ✅ **סטטוס שלב 2:** האם האישור ניתן? האם להמשיך למשימה 2.3?
2. ✅ **Design Tokens JSON:** מה קורה איתם? נשארים או מוסרים?
3. ✅ **שלב 2.4:** האם עדיין צריך לעדכן `CSS_CLASSES_INDEX.md`?
4. ✅ **תיאום Team 30:** איך מתבצע התיאום בשלב 2.5?

### **דורש הבהרה (לא חוסם):**

5. ⚠️ **ולידציה ויזואלית:** מה זה כולל בדיוק?
6. ⚠️ **תוצר שלב 2.5:** מה התוצר הצפוי מ-Team 40?
7. ⚠️ **סקריפטים חיצוניים:** האם חל על עבודה קיימת?

---

## 🔗 קישורים רלוונטיים

### **מסמכים שצריך לעיין בהם:**
- [`_COMMUNICATION/team_10/TEAM_10_TO_ALL_TEAMS_LEGO_REFACTOR_PLAN_V2.md`](../team_10/TEAM_10_TO_ALL_TEAMS_LEGO_REFACTOR_PLAN_V2.md) - התוכנית המעודכנת
- [`_COMMUNICATION/team_40/TEAM_40_TO_TEAM_10_CSS_AUDIT_FINDINGS.md`](./TEAM_40_TO_TEAM_10_CSS_AUDIT_FINDINGS.md) - ממצאי Audit + שאלות
- [`documentation/08-REPORTS/artifacts_SESSION_01/TEAM_40_CSS_HIERARCHY_AUDIT.md`](../../documentation/08-REPORTS/artifacts_SESSION_01/TEAM_40_CSS_HIERARCHY_AUDIT.md) - דוח Audit מלא

### **קבצים רלוונטיים:**
- [`ui/design-tokens/auth.json`](../../ui/design-tokens/auth.json) - Design Tokens JSON
- [`ui/design-tokens/forms.json`](../../ui/design-tokens/forms.json) - Design Tokens JSON
- [`ui/src/styles/phoenix-base.css`](../../ui/src/styles/phoenix-base.css) - CSS Variables

---

## 🎯 הצעדים הבאים (לאחר תשובות)

1. **אם שלב 2 מאושר:** המשך למשימה 2.3 (תיקון היררכיה)
2. **אם שלב 2.4 נדרש:** הוספת משימה לעדכון `CSS_CLASSES_INDEX.md`
3. **תיאום עם Team 30:** תכנון עבודה משותפת על שלב 2.5
4. **החלטה על Design Tokens:** מה קורה עם קבצי ה-JSON

---

```
log_entry | [Team 40] | PLAN_REVIEW | V2 | COMPLETE | 2026-02-01
log_entry | [Team 40] | AWAITING_CLARIFICATIONS | V2 | PENDING | 2026-02-01
```

---

**Prepared by:** Team 40 (UI Assets & Design)  
**Status:** 🟡 **REVIEW COMPLETE - AWAITING CLARIFICATIONS FROM TEAM 10**
