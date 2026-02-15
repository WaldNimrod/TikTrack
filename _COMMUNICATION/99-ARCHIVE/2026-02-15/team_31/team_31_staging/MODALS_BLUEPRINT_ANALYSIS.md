# 📋 ניתוח מודולים (Modals) - מידע קיים והכנת בלופרינטים

**תאריך:** 2026-02-09  
**צוות:** Team 31  
**סטטוס:** ✅ **מידע מלא זמין להכנת בלופרינטים**

---

## 🎯 מטרה

הכנת בלופרינטים ויזואליים למודולים (modals) שישמשו בסיס לשמירת עיצוב אחיד במערכת לגסי ובמערכת החדשה (Phoenix V2).

---

## 📊 סוגי מודולים נדרשים

### 1. מודולי CRUD (הוספה/עריכה)
- **הוספה (Add):** טופס להוספת רשומה חדשה
- **עריכה (Edit):** טופס לעריכת רשומה קיימת
- **מקרים ספציפיים:**
  - D18 - Brokers Fees (ברוקרים ועמלות)
  - D21 - Cash Flows (תזרימי מזומנים)
  - Trades (טריידים)
  - Trade Plans (תכנונים)
  - Watchlists (רשימות צפייה)
  - Tickers (טיקרים)

### 2. מודולי הצגת פרטים (View/Details)
- הצגת פרטים מלאים של רשומה
- תצוגה קריאה בלבד (read-only)
- תמיכה בנתונים מורכבים (טבלאות, רשימות, קישורים)

### 3. מודולי אישור (Confirmation Dialogs)
- אישור פעולות מסוכנות (מחיקה, ביטול)
- אזהרות (warnings)
- הודעות מידע (info)

---

## 📁 מידע קיים במערכת

### 1. CSS קיים - `phoenix-modal.css`
**מיקום:** `ui/src/styles/phoenix-modal.css`

**מבנה CSS:**
- `.phoenix-modal-backdrop` - רקע המודול
- `.phoenix-modal` - קונטיינר המודול
- `.phoenix-modal__header` - כותרת המודול
- `.phoenix-modal__title` - כותרת טקסט
- `.phoenix-modal__close` - כפתור סגירה
- `.phoenix-modal__body` - גוף המודול
- `.phoenix-modal__footer` - תחתית המודול
- `.phoenix-modal__save-btn` / `.phoenix-modal__cancel-btn` - כפתורי פעולה

**מאפיינים:**
- RTL support
- Responsive (mobile-friendly)
- Apple Design Language
- Design Tokens (CSS Variables)

### 2. דוגמאות במערכת לגסי

#### A. מודול CRUD - Trades (דוגמה מלאה)
**מיקום:** `_COMMUNICATION/Legace_html_for_blueprint/Legace_DOM/הרשמה - TikTrack.html` (שורות 418-595)

**מבנה:**
```html
<div class="modal fade" id="tradesModal" tabindex="-1" 
     aria-labelledby="tradesModalLabel" aria-hidden="true" 
     data-bs-backdrop="false" data-bs-keyboard="true" 
     data-entity-type="trade">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header modal-header-colored entity-trade">
        <div class="modal-navigation-breadcrumb"></div>
        <h5 class="modal-title" id="tradesModalLabel">הוספת טרייד</h5>
        <button data-button-type="BACK" ...>חזור</button>
        <button data-button-type="CLOSE" data-bs-dismiss="modal" ...>סגור</button>
      </div>
      <div class="modal-body">
        <form id="tradesModalForm">
          <!-- שדות טופס -->
        </form>
      </div>
      <div class="modal-footer">
        <button data-button-type="CANCEL" data-bs-dismiss="modal">ביטול</button>
        <button data-button-type="SAVE" data-onclick="saveTrade()">שמור</button>
      </div>
    </div>
  </div>
</div>
```

**שדות טופס לדוגמה:**
- טיקר (select, required)
- חשבון מסחר (select, required)
- סוג השקעה (select, required)
- צד (select: Long/Short, required)
- סטטוס (select: פתוח/סגור/מבוטל, required)
- כמות (number, required)
- מחיר כניסה (number, required)
- Stop Loss / Take Profit (number, optional)
- תאריך כניסה (datetime-local, optional)
- תגיות (select multiple, optional)
- הערות (rich text editor, optional)

#### B. מודול CRUD - Tag Management (דוגמה פשוטה יותר)
**מיקום:** `_COMMUNICATION/Legace_html_for_blueprint/Legace_DOM/הרשמה - TikTrack.html` (שורות 595-732)

**מבנה דומה, שדות פשוטים יותר:**
- שם תגית (text, required)
- קטגוריה (select, optional)
- תיאור (textarea, optional)
- תגית פעילה (checkbox, default: true)

#### C. מודול אישור - Confirmation Dialog
**מיקום:** `_COMMUNICATION/Legace_html_for_blueprint/Legace_DOM/login_files/warning-system.js` (שורות 124-347)

**מבנה:**
```html
<div class="modal fade warning-modal" id="confirmationModal" ...>
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header bg-${color} text-white">
        <h5 class="modal-title">${title}</h5>
        <button class="btn-close" data-bs-dismiss="modal">×</button>
      </div>
      <div class="modal-body">
        ${message}
      </div>
      <div class="modal-footer" style="justify-content: flex-end; direction: rtl;">
        <button data-button-type="CANCEL" data-bs-dismiss="modal">ביטול</button>
        <button class="btn btn-${color} confirm-btn">אישור</button>
      </div>
    </div>
  </div>
</div>
```

### 3. ModalManagerV2 (מערכת לגסי)
**מיקום:** `_COMMUNICATION/Legace_html_for_blueprint/Legace_DOM/דף הבית - TikTrack_files/modal-manager-v2.js`

**פונקציונליות:**
- יצירת מודולים דינמיים
- תמיכה ב-CRUD modals
- תמיכה ב-entity types שונים
- Breadcrumb navigation
- Back button support

---

## 📋 סכמות API (למודולי D18 ו-D21)

### D18 - Brokers Fees

**שדות להוספה/עריכה:**
```typescript
{
  broker: string;                    // שם ברוקר (required, max 100 chars)
  commission_type: "TIERED" | "FLAT"; // סוג עמלה (required)
  commission_value: string;          // ערך עמלה (required, max 255 chars)
  minimum: Decimal;                  // מינימום עמלה (required, Decimal(20,8))
}
```

**מקור:** `api/schemas/brokers_fees.py` - `BrokerFeeCreateRequest`, `BrokerFeeUpdateRequest`

### D21 - Cash Flows

**שדות להוספה/עריכה:**
```typescript
{
  trading_account_id: string;        // ULID של חשבון מסחר (required)
  transaction_date: string;          // YYYY-MM-DD (required)
  flow_type: string;                // DEPOSIT | WITHDRAWAL | etc. (required)
  subtype?: string;                 // תת-סוג (optional, from metadata)
  amount: Decimal;                   // סכום (required, Decimal(20,6))
  currency: string;                  // מטבע ISO 3-letter (required)
  status?: string;                  // VERIFIED | PENDING | etc. (optional)
  description?: string;              // תיאור (optional)
}
```

**מקור:** `api/schemas/cash_flows.py` - `CashFlowCreateRequest`, `CashFlowUpdateRequest`

---

## 🎨 עקרונות עיצוב (Phoenix V2)

### 1. מבנה HTML (V3)
```html
<div class="phoenix-modal-backdrop">
  <div class="phoenix-modal">
    <div class="phoenix-modal__header">
      <h2 class="phoenix-modal__title">כותרת</h2>
      <button class="phoenix-modal__close" aria-label="סגור">×</button>
    </div>
    <div class="phoenix-modal__body">
      <!-- תוכן -->
    </div>
    <div class="phoenix-modal__footer">
      <button class="phoenix-modal__cancel-btn">ביטול</button>
      <button class="phoenix-modal__save-btn">שמור</button>
    </div>
  </div>
</div>
```

### 2. Design Tokens
- `--apple-bg-elevated` - רקע מודול
- `--apple-border-light` - גבולות
- `--color-brand` - צבע כפתור שמירה
- `--spacing-lg` / `--spacing-md` - ריווחים
- `--font-size-base` - גודל טקסט

### 3. RTL Support
- כל המודולים תומכים ב-RTL
- כיוון טקסט: `dir="rtl"`
- יישור כפתורים: `justify-content: flex-end`

### 4. Responsive
- Mobile: `max-width: 100%`, `margin: var(--spacing-md)`
- Desktop: `max-width: 600px` (default) / `max-width: 800px` (large)

---

## 📝 בלופרינטים נדרשים

### שלב 1: מודולים בסיסיים (מייצגים)

1. **`modal_add_edit_BLUEPRINT.html`**
   - מודול CRUD כללי להוספה/עריכה
   - דוגמה: D18 - Brokers Fees
   - שדות: text, select, number, textarea
   - מצבים: Add / Edit

2. **`modal_add_edit_complex_BLUEPRINT.html`**
   - מודול CRUD מורכב יותר
   - דוגמה: D21 - Cash Flows
   - שדות: date, select עם options, currency, description
   - ולידציה חזותית

3. **`modal_view_details_BLUEPRINT.html`**
   - מודול הצגת פרטים (read-only)
   - דוגמה: View Broker Fee / Cash Flow
   - תצוגה קריאה של כל השדות
   - כפתור "סגור" בלבד

4. **`modal_confirmation_BLUEPRINT.html`**
   - מודול אישור/אזהרה
   - דוגמה: Delete confirmation
   - הודעת טקסט
   - כפתורים: ביטול / אישור

### שלב 2: מודולים ספציפיים (לפי דרישה)

5. **`modal_brokers_fees_BLUEPRINT.html`** (D18)
6. **`modal_cash_flows_BLUEPRINT.html`** (D21)
7. **`modal_trades_BLUEPRINT.html`**
8. **`modal_trade_plans_BLUEPRINT.html`**

---

## ✅ Checklist הכנה

### מידע זמין:
- [x] CSS קיים (`phoenix-modal.css`)
- [x] דוגמאות HTML במערכת לגסי
- [x] סכמות API (D18, D21)
- [x] מבנה V3 מוגדר
- [x] Design Tokens זמינים
- [x] דרישות Team 50 (TEAM_50_TO_TEAM_30_FIX_REQUEST_CRUD_D18_D21_ADD_EDIT_FORMS.md)

### מה צריך להכין:
- [ ] בלופרינט 1: מודול CRUD בסיסי (D18)
- [ ] בלופרינט 2: מודול CRUD מורכב (D21)
- [ ] בלופרינט 3: מודול הצגת פרטים
- [ ] בלופרינט 4: מודול אישור

---

## 🎯 המלצה

**יש לנו מידע מלא להכנת בלופרינטים!**

מומלץ להתחיל עם 4 בלופרינטים מייצגים:
1. **CRUD בסיסי** (D18 - Brokers Fees)
2. **CRUD מורכב** (D21 - Cash Flows)
3. **View Details** (הצגת פרטים)
4. **Confirmation** (אישור/אזהרה)

בלופרינטים אלה ישמשו כבסיס לכל המודולים במערכת וישמרו על עיצוב אחיד.

---

**מקורות:**
- `ui/src/styles/phoenix-modal.css`
- `_COMMUNICATION/Legace_html_for_blueprint/Legace_DOM/הרשמה - TikTrack.html`
- `api/schemas/brokers_fees.py`
- `api/schemas/cash_flows.py`
- `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_30_FIX_REQUEST_CRUD_D18_D21_ADD_EDIT_FORMS.md`
