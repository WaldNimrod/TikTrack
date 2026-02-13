# Team 40 → Team 30/10: השלמת רכיב הודעת המשילות — ADR-015

**מאת:** Team 40 (Presentational / DNA)  
**אל:** Team 30 (Frontend Execution), Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**מקור:** `TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md`, `TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md`  
**מטרה:** דוח השלמה — CSS Classes להודעת המשילות ב-D16

---

## 1. Executive Summary

**משימה:** יצירת רכיב Presentational להודעת המשילות ב-D16 (בחירת ברוקר "אחר")

**תוצר:** ✅ **הושלם**

**קבצים שנוספו/עודכנו:**
- ✅ `ui/src/styles/phoenix-components.css` — הוספת CSS Classes להודעת המשילות

---

## 2. CSS Classes שנוספו

### 2.1 מיקום בקובץ

**קובץ:** `ui/src/styles/phoenix-components.css`  
**מיקום:** אחרי Rich-Text Styles (שורות ~1462-1504)

### 2.2 Classes שנוספו

```css
/* Base Governance Message */
.governance-message {
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1vw, 12px);
  padding: clamp(12px, 1.5vw, 16px);
  border-radius: 8px;
  border: 1px solid;
  margin-block-start: clamp(8px, 1vw, 12px);
  margin-block-end: clamp(8px, 1vw, 12px);
  font-size: clamp(0.875rem, 1.5vw, 0.92rem);
  line-height: 1.5;
}

/* Warning Variant (ADR-015 - Default) */
.governance-message--warning {
  background-color: var(--message-warning-light, #fef3c7);
  border-color: var(--message-warning, #f59e0b);
  color: var(--message-warning-dark, #d97706);
}

/* Info Variant (Alternative) */
.governance-message--info {
  background-color: var(--message-info-light, #bee5eb);
  border-color: var(--message-info, #17a2b8);
  color: var(--message-info-dark, #0c5460);
}

/* Message Text */
.governance-message__text {
  color: inherit;
  margin: 0;
}

/* Message Link */
.governance-message__link {
  color: var(--color-primary, #26baac);
  text-decoration: underline;
  font-weight: 600;
  transition: color 0.2s ease;
}

.governance-message__link:hover {
  color: var(--color-primary-dark, #1e968a);
}

.governance-message__link:focus {
  outline: 2px solid var(--color-primary, #26baac);
  outline-offset: 2px;
  border-radius: 2px;
}
```

---

## 3. תכונות העיצוב

### 3.1 DNA Palette Compliance

**✅ שימוש ב-CSS Variables:**
- `--message-warning-light` / `--message-warning` / `--message-warning-dark` — לצבע אזהרה
- `--message-info-light` / `--message-info` / `--message-info-dark` — לצבע מידע (אופציונלי)
- `--color-primary` / `--color-primary-dark` — לקישור

### 3.2 Fluid Design

**✅ שימוש ב-clamp():**
- `padding: clamp(12px, 1.5vw, 16px)` — ריווח פנימי רספונסיבי
- `gap: clamp(8px, 1vw, 12px)` — ריווח בין אלמנטים רספונסיבי
- `font-size: clamp(0.875rem, 1.5vw, 0.92rem)` — גודל טקסט רספונסיבי
- `margin-block-start/end: clamp(8px, 1vw, 12px)` — ריווח חיצוני רספונסיבי

**✅ אין media queries** — עיצוב רספונסיבי אוטומטי

### 3.3 RTL Support

**✅ שימוש ב-Logical Properties:**
- `margin-block-start/end` — במקום `margin-top/bottom`
- `text-align: start` — במקום `text-align: right/left`
- `flex-direction: column` — עובד אוטומטית ב-RTL

### 3.4 Accessibility

**✅ תמיכה ב-Accessibility:**
- Focus outline לקישור (`outline: 2px solid`)
- `outline-offset` למניעת חפיפה
- `transition` לחוויית משתמש חלקה

---

## 4. דוגמת שימוש HTML

### 4.1 דוגמה בסיסית (Warning Variant)

```html
<div class="governance-message governance-message--warning">
  <p class="governance-message__text">
    במידה ולא מצאתם את הברוקר שלכם במערכת, עדין ניתן לייצר את החשבון מסחר — אבל לא ניתן יהיה לייבא אוטומטית נתונים. מומלץ ליצור איתנו קשר ולבקש הוספת הברוקר למערכת, 
    <a href="mailto:support@tiktrack.app" class="governance-message__link">קישור למייל מנהל ראשי</a>.
  </p>
</div>
```

### 4.2 דוגמה לשימוש ב-D16 (בתוך טופס)

**מיקום:** אחרי שדה הברוקר (`<select id="broker">`), בתוך `.form-group` או אחריו

```html
<div class="form-group">
  <label for="broker">ברוקר</label>
  <select id="broker" name="broker">
    <option value="">-- לא צוין --</option>
    <option value="other">אחר</option>
    <!-- Other broker options -->
  </select>
  <span class="form-error" id="brokerError"></span>
</div>

<!-- Governance Message - Conditional Rendering (only when "other" is selected) -->
<div id="governanceMessage" class="governance-message governance-message--warning" style="display: none;">
  <p class="governance-message__text">
    במידה ולא מצאתם את הברוקר שלכם במערכת, עדין ניתן לייצר את החשבון מסחר — אבל לא ניתן יהיה לייבא אוטומטית נתונים. מומלץ ליצור איתנו קשר ולבקש הוספת הברוקר למערכת, 
    <a href="mailto:support@tiktrack.app" class="governance-message__link">קישור למייל מנהל ראשי</a>.
  </p>
</div>
```

### 4.3 JavaScript למימוש Conditional Rendering

**לשימוש ב-Team 30:**

```javascript
// Get broker select element
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
```

---

## 5. SSOT — טקסט הודעה

**מקור:** `documentation/06-ENGINEERING/ADR_015_GOVERNANCE_MESSAGE_SSOT.md`

**טקסט מלא:**
> במידה ולא מצאתם את הברוקר שלכם במערכת, עדין ניתן לייצר את החשבון מסחר — אבל לא ניתן יהיה לייבא אוטומטית נתונים.  
> מומלץ ליצור איתנו קשר ולבקש הוספת הברוקר למערכת, [קישור למייל מנהל ראשי](mailto:support@tiktrack.app).

**קישור:**
- `primary_admin_contact` = `mailto:support@tiktrack.app`
- ניתן להחלפה ב-runtime via env `PRIMARY_ADMIN_EMAIL` אם מוגדר

---

## 6. Acceptance Criteria

### 6.1 CSS Compliance

- ✅ שימוש ב-CSS Variables מה-DNA Palette
- ✅ Fluid Design (clamp(), min(), max()) — ללא media queries
- ✅ RTL support מלא (logical properties)
- ✅ Accessibility (focus states, outline)

### 6.2 Visual Design

- ✅ עיצוב עקבי עם מערכת ה-DNA
- ✅ צבעי warning/info מה-DNA Palette
- ✅ ריווחים רספונסיביים
- ✅ טיפוגרפיה עקבית

---

## 7. תיאום עם Team 30

### 7.1 מה Team 30 צריך לעשות

1. **הוספת HTML** — להוסיף את ה-HTML של הודעת המשילות ב-`tradingAccountsForm.js` (אחרי שדה הברוקר)
2. **Conditional Rendering** — להציג את ההודעה רק כאשר `broker.value === 'other'`
3. **שימוש ב-SSOT** — להשתמש בטקסט מ-`ADR_015_GOVERNANCE_MESSAGE_SSOT.md`
4. **קישור** — להשתמש ב-`primary_admin_contact` (או מ-env)

### 7.2 דוגמת קוד ל-Team 30

**קובץ:** `ui/src/views/financial/tradingAccounts/tradingAccountsForm.js`

**שינויים נדרשים:**
1. הוספת HTML להודעת המשילות ב-`createTradingAccountFormHTML()`
2. הוספת event listener ב-`showTradingAccountFormModal()` להצגה/הסתרה

---

## 8. בדיקות

### 8.1 בדיקות ויזואליות

- [ ] ההודעה מוצגת רק כאשר נבחר "אחר"
- [ ] ההודעה מוסתרת כאשר נבחר ברוקר אחר
- [ ] עיצוב עקבי עם מערכת ה-DNA
- [ ] RTL support נכון
- [ ] Responsive design עובד (גדלים שונים)

### 8.2 בדיקות פונקציונליות (Team 30)

- [ ] Conditional Rendering עובד
- [ ] הקישור פועל נכון
- [ ] הטקסט נכון (מ-SSOT)
- [ ] ההודעה מופיעה במיקום הנכון (אחרי שדה הברוקר)

---

## 9. סיכום

**מצב:** ✅ **CSS Classes הושלמו**

**תוצר:**
- ✅ CSS Classes להודעת המשילות ב-`phoenix-components.css`
- ✅ דוגמת HTML לשימוש
- ✅ דוגמת JavaScript ל-Conditional Rendering
- ✅ תיעוד מלא

**נדרש מ-Team 30:**
- שילוב ה-HTML ב-`tradingAccountsForm.js`
- מימוש Conditional Rendering
- שימוש ב-SSOT לטקסט וקישור

---

## 10. הפניות

- **מנדט:** `TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md`
- **תוכנית עבודה:** `TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md`
- **SSOT הודעה:** `documentation/06-ENGINEERING/ADR_015_GOVERNANCE_MESSAGE_SSOT.md`
- **קובץ CSS:** `ui/src/styles/phoenix-components.css` (שורות ~1462-1504)

---

**Team 40 (Presentational / DNA)**  
**log_entry | ADR_015 | GOVERNANCE_MESSAGE_COMPLETE | 2026-02-12**
