# 🔍 מדריך ולידציה פנימית ועדכון סנדבוקס - Team 30

**From:** Team 10 (The Gateway)  
**To:** Team 30 (Frontend)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.1  
**Subject:** תהליך ולידציה פנימית ועדכון סנדבוקס לפני הגשה ל-QA  
**Status:** 📋 **WORKFLOW GUIDE**

**בשיתוף:** Team 50 (QA)

---

## 🎯 מטרת המדריך

מדריך זה מסביר כיצד לבצע **ולידציה פנימית** לפני הגשת קבצים ל-QA. מטרת הולידציה הפנימית היא לזהות ולתקן בעיות לפני שהקבצים מגיעים ל-Team 50, מה שמאיץ את התהליך ומבטיח איכות גבוהה.

---

## 📋 תהליך הולידציה הפנימית (Pre-QA Validation)

### שלב 1: הכנת הקובץ

**לפני כל שינוי:**
1. ודא שהקובץ עומד ב-**LEGO System**:
   - שימוש ב-`<tt-container>`, `<tt-section>`, `<tt-section-row>`
   - אין שימוש ב-`<div class="section">` או `<div class="card">`

2. ודא **RTL Charter**:
   - אין תכונות פיזיות: `margin-left`, `margin-right`, `padding-left`, `padding-right`, `left:`, `right:`
   - שימוש בלוגיות: `margin-inline-start`, `padding-block-end` וכו'

3. ודא **DNA Variables**:
   - אין צבעי Hex קשיחים (חוץ מ-`#26baac`, `#dc2626`, `#f8fafc`)
   - כל הצבעים דרך CSS variables: `var(--color-brand)`

4. ודא **Structural Integrity**:
   - אם זה `index.html` - חייב לכלול `unified-header` (158px)

---

### שלב 2: הרצת G-Bridge מקומי

**כלי:** `_COMMUNICATION/cursor_messages/HOENIX G-BRIDGE.js`

**פקודה:**
```bash
cd _COMMUNICATION/team_01/team_01_staging
node "../../cursor_messages/HOENIX G-BRIDGE.js" [שם_הקובץ].html
```

**דוגמה:**
```bash
node "../../cursor_messages/HOENIX G-BRIDGE.js" D15_LOGIN.html
```

**תוצאה:**
- ✅ **PASSED** - הקובץ עבר את כל הבדיקות
- ❌ **FAILED** - יש בעיות שצריך לתקן

**אם FAILED:**
- הסקריפט יציג את הבעיות (RTL, LEGO, DNA, STRUCTURE)
- תקן את הבעיות וחזור על הבדיקה
- חזור על התהליך עד שתקבל ✅ PASSED

**פלט:**
```
=========================================
🛡️ G-BRIDGE LOCAL AUDIT: D15_LOGIN.html
Status: ✅ PASSED
-----------------------------------------
👉 Open '_PREVIEW_D15_LOGIN.html' to see the Sandbox view.
=========================================
```

---

### שלב 3: בדיקת תצוגת הסנדבוקס

**לאחר PASSED:**
1. פתח את הקובץ `_PREVIEW_[שם_הקובץ].html` בדפדפן
2. ודא שהבאנר הירוק מופיע בראש העמוד:
   ```
   🛡️ LOCAL G-BRIDGE [שעה] | APPROVED | FIDELITY READY
   ```
3. בדוק שהעמוד נראה תקין:
   - עימוד נכון
   - צבעים נכונים
   - RTL תקין
   - כל האלמנטים במקום

---

### שלב 4: עדכון SANDBOX_INDEX.html

**מיקום:** `_COMMUNICATION/team_01/team_01_staging/SANDBOX_INDEX.html`

**תהליך עדכון:**

1. **פתח את SANDBOX_INDEX.html** בעורך טקסט

2. **מצא את השורה של הקובץ שלך** בטבלה (חפש לפי שם הקובץ):
   ```html
   <tr>
     <td><a href="./D15_LOGIN.html?t=1769855022401" style="font-weight:bold; color: #1e293b;">D15_LOGIN.html</a></td>
     <td>N/A</td>
     <td style="font-size: 10px;">N/A</td>
     <td><span style="color:#059669; font-weight:800;">💎 BLUEPRINT READY</span></td>
   </tr>
   ```

3. **עדכן את הסטטוס** לפי התוצאה:
   
   **אם PASSED:**
   ```html
   <td><span style="color:#059669; font-weight:800;">💎 BLUEPRINT READY</span></td>
   ```
   
   **אם FAILED:**
   ```html
   <td><span style="color:#dc2626; font-weight:800;">❌ FAILED</span></td>
   ```
   
   **אם APPROVED על ידי QA:**
   ```html
   <td><span style="color:#2563eb; font-weight:800;">✅ APPROVED (STAGING)</span></td>
   ```

4. **עדכן את ה-timestamp** (אופציונלי, אבל מומלץ):
   ```html
   <!-- לפני -->
   <a href="./D15_LOGIN.html?t=1769855022401">
   
   <!-- אחרי (timestamp נוכחי) -->
   <a href="./D15_LOGIN.html?t=1738345678901">
   ```
   **יצירת timestamp:** `Date.now()` ב-JavaScript או `Math.floor(Date.now() / 1000)` ב-Node.js

5. **שמור את הקובץ**

**דוגמה מלאה לעדכון:**
```html
<!-- לפני (FAILED) -->
<tr>
  <td><a href="./D15_LOGIN.html?t=1769855022401" style="font-weight:bold; color: #1e293b;">D15_LOGIN.html</a></td>
  <td>N/A</td>
  <td style="font-size: 10px;">N/A</td>
  <td><span style="color:#dc2626; font-weight:800;">❌ FAILED</span></td>
</tr>

<!-- אחרי (לאחר תיקון ו-PASSED) -->
<tr>
  <td><a href="./D15_LOGIN.html?t=1738345678901" style="font-weight:bold; color: #1e293b;">D15_LOGIN.html</a></td>
  <td>N/A</td>
  <td style="font-size: 10px;">N/A</td>
  <td><span style="color:#059669; font-weight:800;">💎 BLUEPRINT READY</span></td>
</tr>
```

**⚠️ חשוב:**
- אל תשנה שורות של קבצים אחרים בטבלה
- ודא שהפורמט נשמר (רווחים, גרשיים, וכו')
- אם הקובץ לא קיים בטבלה - הוסף שורה חדשה לפני השורה האחרונה (לפני `</tbody>`)

---

### שלב 5: בדיקת DOM (אופציונלי - למתקדמים)

**כלי:** `_COMMUNICATION/cursor_messages/DOM_INSPECTOR.js`

**שימוש:**
1. פתח את הקובץ בדפדפן
2. פתח קונסולה (F12 > Console)
3. העתק והדבק את הקוד מ-`DOM_INSPECTOR.js`
4. הסקריפט יחזיר:
   - DOM מלא עם כל המחלקות
   - CSS computed styles
   - ניתוח היררכיית LEGO
   - זיהוי בעיות

**פלט:**
- `window.phoenixDOMInspection` - התוצאה המלאה
- `window.copyPhoenixDOM()` - העתקה ל-clipboard

---

## 🚀 תהליך הגשה ל-QA

### מתי להגיש?

**רק לאחר:**
- ✅ G-Bridge PASSED (מקומי)
- ✅ תצוגת סנדבוקס תקינה
- ✅ SANDBOX_INDEX.html מעודכן
- ✅ בדיקה ויזואלית עברה בהצלחה

### איך להגיש?

1. **ודא שהקובץ בסטייג'ינג:**
   - מיקום: `_COMMUNICATION/team_01/team_01_staging/[שם_קובץ].html`

2. **ודא ש-SANDBOX_INDEX.html מעודכן:**
   - הקובץ מופיע בטבלה
   - הסטטוס הוא `💎 BLUEPRINT READY` (ירוק)

3. **שלח הודעה ל-Team 10:**
   ```text
   From: Team 30
   To: Team 10 (The Gateway)
   Subject: File Ready for QA | [שם_קובץ].html
   
   File: _COMMUNICATION/team_01/team_01_staging/[שם_קובץ].html
   Status: ✅ G-Bridge PASSED (Local)
   Sandbox Status: 💎 BLUEPRINT READY
   Ready for: QA Validation (Team 50)
   
   log_entry | [Team 30] | FILE_READY | [שם_קובץ] | GREEN
   ```

---

## 🔍 מה Team 50 בודק?

### שלב 1: G-Bridge Validation
- ✅ Team 50 מריץ G-Bridge על הקובץ
- ✅ אם REJECTED → הקובץ מוחזר מיד ללא בדיקה נוספת
- ✅ אם APPROVED → ממשיכים לשלב הבא

### שלב 2: Fidelity Review (פיקסל-פיקסל)
- ✅ השוואה מול עמוד הלגסי המקורי
- ✅ בדיקת פונטים, צבעים, עימוד, טקסטים
- ✅ מטרה: Digital Twin 100%

### שלב 3: עדכון מטריצה
- ✅ עדכון `OFFICIAL_PAGE_TRACKER` (אם קיים)
- ✅ מעבר משלב 3 (Audit) לשלב 4 (Fidelity Review)
- ✅ רק לאחר אישור 100% → סטטוס 5 (APPROVED)

---

## ⚠️ טיפים להצלחה

### 1. בדוק לפני הגשה
- **חובה:** הרץ G-Bridge מקומי לפני כל הגשה
- זה חוסך זמן ומאיץ את התהליך

### 2. תקן בעיות מיד
- אם G-Bridge מצא בעיות → תקן מיד
- אל תגיש קבצים עם REJECTED

### 3. עדכן את SANDBOX_INDEX
- זה עוזר ל-QA לזהות קבצים חדשים
- זה עוזר לך לעקוב אחרי הסטטוס

### 4. בדוק ויזואלית
- פתח את `_PREVIEW_*.html` בדפדפן
- ודא שהכל נראה תקין

---

## 📝 דוגמה מלאה: תהליך עבודה

### תרחיש: עדכון D15_LOGIN.html

**שלב 1: הכנה**
```bash
# עבור לתיקיית סטייג'ינג
cd _COMMUNICATION/team_01/team_01_staging

# ערוך את הקובץ
# ... עריכות ...
```

**שלב 2: G-Bridge**
```bash
node "../../cursor_messages/HOENIX G-BRIDGE.js" D15_LOGIN.html
```

**תוצאה:**
```
Status: ✅ PASSED
👉 Open '_PREVIEW_D15_LOGIN.html' to see the Sandbox view.
```

**שלב 3: בדיקה ויזואלית**
- פתח `_PREVIEW_D15_LOGIN.html`
- ודא שהבאנר ירוק
- בדוק שהעמוד נראה תקין

**שלב 4: עדכון SANDBOX_INDEX**
- פתח `SANDBOX_INDEX.html`
- עדכן את הסטטוס ל-`💎 BLUEPRINT READY`
- שמור

**שלב 5: הגשה**
- שלח הודעה ל-Team 10
- ציין שהקובץ מוכן ל-QA

---

## 🛠️ כלי עזר זמינים

### 1. G-Bridge Local Emulator
**מיקום:** `_COMMUNICATION/cursor_messages/HOENIX G-BRIDGE.js`  
**שימוש:** ולידציה מקומית לפני הגשה

### 2. G-Bridge Extract & Validate
**מיקום:** `_COMMUNICATION/cursor_messages/G_BRIDGE_EXTRACT_VALIDATE.js`  
**שימוש:** לקבצים שכבר עטופים ב-G-Bridge shell

### 3. DOM Inspector
**מיקום:** `_COMMUNICATION/cursor_messages/DOM_INSPECTOR.js`  
**שימוש:** ניתוח DOM מלא ומפורט

---

## ❓ שאלות נפוצות

### Q: מה אם G-Bridge נכשל?
**A:** תקן את הבעיות שהסקריפט מצא וחזור על הבדיקה. אל תגיש קבצים עם REJECTED.

### Q: האם אני חייב לעדכן את SANDBOX_INDEX?
**A:** כן, זה עוזר ל-QA לזהות קבצים חדשים ומאיץ את התהליך.

### Q: מה אם יש לי שאלות על הבעיות?
**A:** פנה ל-Team 10 (The Gateway) - הם יעזרו לך.

### Q: כמה פעמים אני צריך להריץ G-Bridge?
**A:** לפחות פעם אחת לפני כל הגשה. מומלץ להריץ גם אחרי כל שינוי משמעותי.

---

## 📊 סטטוסים ב-SANDBOX_INDEX

| סטטוס | צבע | משמעות |
|--------|-----|--------|
| `💎 BLUEPRINT READY` | ירוק | עבר G-Bridge, מוכן ל-QA |
| `✅ APPROVED (STAGING)` | כחול | עבר QA, ממתין לאינטגרציה |
| `❌ FAILED` | אדום | נכשל ב-G-Bridge, צריך תיקון |

---

## ✅ Checklist לפני הגשה

לפני שאתה מגיש קובץ ל-QA, ודא:

- [ ] הקובץ עבר G-Bridge מקומי (✅ PASSED)
- [ ] תצוגת סנדבוקס נראית תקינה
- [ ] SANDBOX_INDEX.html מעודכן
- [ ] הקובץ במיקום הנכון (`team_01_staging/`)
- [ ] בדיקה ויזואלית עברה בהצלחה
- [ ] הודעה נשלחה ל-Team 10

---

## 🎯 סיכום

**תהליך הולידציה הפנימית:**
1. הכנת קובץ (LEGO, RTL, DNA, Structure)
2. הרצת G-Bridge מקומי
3. בדיקת תצוגת סנדבוקס
4. עדכון SANDBOX_INDEX.html
5. הגשה ל-QA

**זכור:**
- ✅ ולידציה פנימית חוסכת זמן
- ✅ G-Bridge הוא הכלי שלך לבדיקה מקומית
- ✅ SANDBOX_INDEX עוזר לעקוב אחרי סטטוסים
- ✅ אל תגיש קבצים עם REJECTED

---

**Prepared by:** Team 10 (The Gateway)  
**In collaboration with:** Team 50 (QA)  
**Status:** 📋 WORKFLOW GUIDE  
**Next:** Team 30 to implement internal validation workflow
