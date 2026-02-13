# Team 40 → Team 30: תיאום — הודעת המשילות ADR-015

**מאת:** Team 40 (Presentational / DNA)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-12  
**מקור:** `TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md`  
**מטרה:** תיאום שילוב הודעת המשילות ב-D16

---

## 1. Executive Summary

**משימה:** שילוב הודעת המשילות ב-D16 (בחירת ברוקר "אחר")

**מצב:** ✅ **CSS Classes מוכנים לשימוש**

**תוצר Team 40:**
- ✅ CSS Classes ב-`phoenix-components.css`
- ✅ דוגמת HTML לשימוש
- ✅ דוגמת JavaScript ל-Conditional Rendering

**נדרש מ-Team 30:**
- שילוב ה-HTML ב-`tradingAccountsForm.js`
- מימוש Conditional Rendering

---

## 2. CSS Classes מוכנים

### 2.1 Classes שנוספו

**קובץ:** `ui/src/styles/phoenix-components.css`

**Classes:**
- `.governance-message` — בסיס
- `.governance-message--warning` — variant אזהרה (מומלץ)
- `.governance-message--info` — variant מידע (אופציונלי)
- `.governance-message__text` — טקסט
- `.governance-message__link` — קישור

**תכונות:**
- ✅ DNA Palette compliance
- ✅ Fluid Design (clamp())
- ✅ RTL support מלא
- ✅ Accessibility (focus states)

---

## 3. דוגמת HTML לשימוש

### 3.1 HTML בסיסי

```html
<div id="governanceMessage" class="governance-message governance-message--warning" style="display: none;">
  <p class="governance-message__text">
    במידה ולא מצאתם את הברוקר שלכם במערכת, עדין ניתן לייצר את החשבון מסחר — אבל לא ניתן יהיה לייבא אוטומטית נתונים. מומלץ ליצור איתנו קשר ולבקש הוספת הברוקר למערכת, 
    <a href="mailto:support@tiktrack.app" class="governance-message__link">קישור למייל מנהל ראשי</a>.
  </p>
</div>
```

### 3.2 מיקום ב-Trading Accounts Form

**קובץ:** `ui/src/views/financial/tradingAccounts/tradingAccountsForm.js`

**מיקום:** אחרי שדה הברוקר (שורות 50-57), בתוך או אחרי `.form-group`

**דוגמה:**
```javascript
function createTradingAccountFormHTML(data = null, brokerOptions = []) {
  // ... existing code ...
  
  return `
    <form id="tradingAccountForm" class="phoenix-form">
      <!-- ... existing form fields ... -->
      
      <div class="form-group">
        <label for="broker">ברוקר</label>
        <select id="broker" name="broker">
          <option value="">-- לא צוין --</option>
          ${brokerOptionsHTML}
        </select>
        <span class="form-error" id="brokerError"></span>
      </div>
      
      <!-- Governance Message - ADR-015 -->
      <div id="governanceMessage" class="governance-message governance-message--warning" style="display: none;">
        <p class="governance-message__text">
          במידה ולא מצאתם את הברוקר שלכם במערכת, עדין ניתן לייצר את החשבון מסחר — אבל לא ניתן יהיה לייבא אוטומטית נתונים. מומלץ ליצור איתנו קשר ולבקש הוספת הברוקר למערכת, 
          <a href="mailto:support@tiktrack.app" class="governance-message__link">קישור למייל מנהל ראשי</a>.
        </p>
      </div>
      
      <!-- ... rest of form fields ... -->
    </form>
  `;
}
```

---

## 4. Conditional Rendering

### 4.1 JavaScript למימוש

**קובץ:** `ui/src/views/financial/tradingAccounts/tradingAccountsForm.js`

**מיקום:** ב-`showTradingAccountFormModal()` אחרי יצירת המודל

**דוגמה:**
```javascript
export async function showTradingAccountFormModal(data, onSave) {
  // ... existing code ...
  
  createModal({
    title: title,
    content: formHTML,
    entity: 'trading_account',
    showSaveButton: true,
    saveButtonText: 'שמור',
    onSave: async function() {
      // ... existing save logic ...
    }
  });
  
  // ADR-015: Governance Message Conditional Rendering
  const brokerSelect = document.getElementById('broker');
  const governanceMessage = document.getElementById('governanceMessage');
  
  if (brokerSelect && governanceMessage) {
    // Show/hide message based on selection
    brokerSelect.addEventListener('change', function() {
      if (this.value === 'other') {
        governanceMessage.style.display = 'flex';
      } else {
        governanceMessage.style.display = 'none';
      }
    });
    
    // Check initial value (for edit mode)
    if (brokerSelect.value === 'other') {
      governanceMessage.style.display = 'flex';
    }
  }
}
```

---

## 5. SSOT — טקסט וקישור

### 5.1 טקסט הודעה

**מקור:** `documentation/06-ENGINEERING/ADR_015_GOVERNANCE_MESSAGE_SSOT.md`

**טקסט מלא:**
> במידה ולא מצאתם את הברוקר שלכם במערכת, עדין ניתן לייצר את החשבון מסחר — אבל לא ניתן יהיה לייבא אוטומטית נתונים.  
> מומלץ ליצור איתנו קשר ולבקש הוספת הברוקר למערכת, [קישור למייל מנהל ראשי](mailto:support@tiktrack.app).

### 5.2 קישור

**ערך SSOT:**
- `primary_admin_contact` = `mailto:support@tiktrack.app`
- ניתן להחלפה ב-runtime via env `PRIMARY_ADMIN_EMAIL` אם מוגדר

**מימוש מוצע:**
```javascript
// Get admin contact from SSOT or env
const adminContact = process.env.PRIMARY_ADMIN_EMAIL 
  ? `mailto:${process.env.PRIMARY_ADMIN_EMAIL}` 
  : 'mailto:support@tiktrack.app';

// Use in HTML
`<a href="${adminContact}" class="governance-message__link">קישור למייל מנהל ראשי</a>`
```

---

## 6. בדיקות נדרשות

### 6.1 בדיקות פונקציונליות

- [ ] ההודעה מוצגת רק כאשר `broker.value === 'other'`
- [ ] ההודעה מוסתרת כאשר נבחר ברוקר אחר
- [ ] ההודעה מוצגת נכון במצב עריכה (אם broker === 'other')
- [ ] הקישור פועל נכון

### 6.2 בדיקות ויזואליות

- [ ] עיצוב עקבי עם מערכת ה-DNA
- [ ] RTL support נכון
- [ ] Responsive design עובד
- [ ] Focus states עובדים (קישור)

---

## 7. שאלות/הבהרות

### שאלה 1: מיקום הודעה
**שאלה:** האם ההודעה צריכה להיות בתוך `.form-group` או אחריו?

**המלצה:** אחרי `.form-group` של הברוקר — כך שההודעה תופיע כפריט נפרד

---

### שאלה 2: ערך "אחר" ב-API
**שאלה:** מה הערך המדויק של "אחר" ב-API? (`value: "other"`?)

**לפי ADR-015:** `value: "other"`, `is_supported: false`

---

### שאלה 3: קישור דינמי
**שאלה:** האם צריך לקרוא את `primary_admin_contact` מ-SSOT או מ-env?

**המלצה:** להשתמש ב-env אם קיים, אחרת ברירת מחדל `mailto:support@tiktrack.app`

---

## 8. סיכום

**מצב:** ✅ **CSS Classes מוכנים לשימוש**

**תוצר Team 40:**
- ✅ CSS Classes ב-`phoenix-components.css`
- ✅ דוגמת HTML
- ✅ דוגמת JavaScript

**נדרש מ-Team 30:**
- שילוב ה-HTML ב-`tradingAccountsForm.js`
- מימוש Conditional Rendering
- שימוש ב-SSOT לטקסט וקישור

**תוצר מצופה:**
- הודעת המשילות מוצגת ב-D16 כאשר נבחר "אחר"
- עיצוב עקבי עם מערכת ה-DNA
- Conditional Rendering עובד נכון

---

## 9. הפניות

- **מנדט:** `TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md`
- **תוכנית עבודה:** `TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md`
- **SSOT הודעה:** `documentation/06-ENGINEERING/ADR_015_GOVERNANCE_MESSAGE_SSOT.md`
- **דוח השלמה:** `TEAM_40_ADR_015_GOVERNANCE_MESSAGE_COMPLETE.md`
- **קובץ CSS:** `ui/src/styles/phoenix-components.css`

---

**Team 40 (Presentational / DNA)**  
**log_entry | ADR_015 | GOVERNANCE_MESSAGE_COORDINATION | 2026-02-12**
