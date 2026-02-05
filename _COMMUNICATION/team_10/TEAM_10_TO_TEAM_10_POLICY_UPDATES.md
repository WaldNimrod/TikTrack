# 📝 הודעה: עדכון מדיניות ותיעוד

**מאת:** Team 10 (The Gateway)  
**אל:** Team 10 (The Gateway) - משימות פנימיות  
**תאריך:** 2026-02-04  
**סטטוס:** 🟡 **HIGH PRIORITY - P1**  
**מקור:** פקודת האדריכל המאוחדת + דוח ביקורת חיצונית

---

## 📢 Executive Summary

לפי פקודת האדריכל ודוח הביקורת החיצונית, יש לעדכן מספר מסמכי מדיניות ותיעוד.

---

## 📋 משימות

### **1. עדכון `PHOENIX_MASTER_BIBLE.md` - מדיניות סקריפטים** 🔴 **P0**

**בעיה:** הקובץ אוסר כל `<script>` ב-HTML, אבל בפועל יש שימוש ב-`<script src>` (נכון).

**פעולות:**
1. לעדכן את הכלל לאסור רק inline scripts
2. לאפשר `<script src>` לטעינת תשתיות

**לפני:**
```
איסור מוחלט על <script> בתוך HTML/JSX
```

**אחרי:**
```
מותר: <script src="..."> לטעינת תשתיות (Bridge, Loaders)
אסור: קוד Inline JavaScript בתוך ה-HTML
```

---

### **2. יצירת `ARCHITECT_POLICY_HYBRID_SCRIPTS.md`** 🟡 **P1**

**פעולות:**
1. ליצור מסמך מדיניות מפורט על סקריפטים היברידיים
2. להסביר מתי מותר `<script src>` ומתי אסור inline

**מיקום:** `documentation/09-GOVERNANCE/standards/ARCHITECT_POLICY_HYBRID_SCRIPTS.md`

---

### **3. עדכון `.cursorrules` - מינוח יחיד** ⚠️ **CLARIFICATION REQUIRED**

**בעיה:** `.cursorrules` מציין "Plural names only", אבל פקודת האדריכל דורשת יחיד.

**פעולות:**
1. **לאחר הבהרה** - לעדכן את הכלל למינוח יחיד
2. להסביר מתי מותר רבים (רק למערכים)

---

### **4. יצירת `ARCHITECT_MANDATE_SINGULAR_NAMING.md`** ⚠️ **CLARIFICATION REQUIRED**

**פעולות:**
1. **לאחר הבהרה** - ליצור מסמך מדיניות מפורט על מינוח יחיד
2. להסביר את הכללים והחרגות

**מיקום:** `documentation/09-GOVERNANCE/standards/ARCHITECT_MANDATE_SINGULAR_NAMING.md`

---

### **5. עדכון `D15_SYSTEM_INDEX.md`** 🟢 **P2**

**בעיה:** הקובץ מפנה ל-`TT2_INFRASTRUCTURE_GUIDE.md` שאינו קיים.

**פעולות:**
1. להסיר את הקישור למסמך החסר
2. או ליצור את המסמך החסר

---

### **6. עדכון `ui/infrastructure/README.md`** 🟢 **P2**

**בעיה:** הקובץ עדיין מציין `ui/design-tokens/` שהוסר.

**פעולות:**
1. להסיר את כל האזכורים ל-design-tokens
2. לעדכן ל-`phoenix-base.css` כ-SSOT

---

### **7. עדכון מסמכי ארכיטקטורה - יישור שמות קבצים** 🟢 **P2**

**בעיה:** יש אי-התאמה בין שמות קבצים בתיעוד לקוד (hyphen vs camelCase).

**פעולות:**
1. לבחור תקן אחד (מומלץ kebab-case בתיעוד)
2. לעדכן את כל המסמכים

**קבצים לעדכון:**
- `PHOENIX_REACT_HTML_BOUNDARIES.md`
- `PHOENIX_NAVIGATION_STRATEGY.md`
- `PHOENIX_AUTH_INTEGRATION.md`

---

### **8. עדכון `TT2_UI_INTEGRATION_PATTERN.md`** 🟡 **P1**

**בעיה:** הקובץ מציין "Zustand Store" אבל צריך להסיר.

**פעולות:**
1. להסיר את האזכור ל-Zustand
2. לעדכן ל-React Context בלבד

---

## 📚 מסמכים קשורים

- `ARCHITECT_PORT_LOCK.md` - פקודת האדריכל
- `TEAM_10_EXTERNAL_AUDIT_FINAL_REPORT.md` - דוח ביקורת חיצונית

---

## ⏱️ זמן משוער

**2-3 שעות**

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-04  
**סטטוס:** 🟡 **HIGH PRIORITY - P1**

**log_entry | [Team 10] | POLICY_UPDATES | INTERNAL | YELLOW | 2026-02-04**
