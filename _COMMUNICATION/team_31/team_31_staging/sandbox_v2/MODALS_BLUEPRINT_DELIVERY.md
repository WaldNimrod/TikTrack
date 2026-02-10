# ✅ מסירת בלופרינטים למודולים (Modals)

**תאריך:** 2026-02-09  
**צוות:** Team 31  
**סטטוס:** ✅ **מוכן לבדיקה ויזואלית**

---

## 📋 סיכום

הושלמו 4 בלופרינטים מייצגים למודולים במערכת, שישמשו כבסיס לשמירת עיצוב אחיד בכל המודולים במערכת לגסי ובמערכת החדשה (Phoenix V2).

---

## 📁 קבצים שנוצרו

### 1. `modal_add_edit_BLUEPRINT.html`
**תיאור:** מודול CRUD בסיסי להוספה ועריכה  
**דוגמה:** D18 - Brokers Fees  
**שדות:**
- שם ברוקר (text, required)
- סוג עמלה (select: TIERED/FLAT, required)
- ערך עמלה (text, required)
- מינימום עמלה (number, required)

**מצבים:** Add / Edit

### 2. `modal_add_edit_complex_BLUEPRINT.html`
**תיאור:** מודול CRUD מורכב להוספה ועריכה  
**דוגמה:** D21 - Cash Flows  
**שדות:**
- חשבון מסחר (select, required)
- תאריך תזרים (date, required)
- סוג תזרים (select: DEPOSIT/WITHDRAWAL/etc., required)
- סכום ומטבע (number + select, required)
- תת-סוג (select, optional)
- סטטוס (select, optional)
- תיאור (textarea, optional)
- התייחסות חיצונית (text, optional)

**מצבים:** Add / Edit

### 3. `modal_view_details_BLUEPRINT.html`
**תיאור:** מודול הצגת פרטים (read-only)  
**דוגמה:** View Broker Fee / Cash Flow Details  
**תכונות:**
- תצוגה קריאה של כל השדות
- ארגון לפי סקשנים (מידע בסיסי, מידע נוסף)
- Badges לסטטוסים
- תמיכה בנתונים מורכבים

**מצבים:** View (read-only)

### 4. `modal_confirmation_BLUEPRINT.html`
**תיאור:** מודול אישור/אזהרה  
**דוגמאות:**
- מחיקה (Danger - Red)
- אזהרה (Warning - Orange)
- מידע (Info - Blue)

**תכונות:**
- אייקונים מותאמים לסוג ההודעה
- כותרות צבעוניות
- כפתורי פעולה מותאמים

---

## ✅ עמידה ב-Checklist

כל הבלופרינטים עומדים בדרישות המחייבות לפי `TT2_BLUEPRINT_HANDOFF_REQUIREMENTS.md`:

- [x] **תבנית V3:** מבנה תקין (לא נדרש page-wrapper למודולים)
- [x] **רכיבי LEGO:** שימוש ב-CSS classes קיימות מ-`phoenix-modal.css`
- [x] **סדר טעינת CSS:** תואם ל-`CSS_LOADING_ORDER.md`
- [x] **Pixel Perfect:** תוכן דמה מלא ומציאותי
- [x] **כל המצבים:** Add, Edit, View, Confirmation (Danger/Warning/Info)
- [x] **אין Inline Styles:** כל הסגנונות ב-CSS
- [x] **אין Inline Scripts:** כל הפעולות ב-`data-action` attributes

---

## 🎨 עקרונות עיצוב

### CSS קיים
כל הבלופרינטים משתמשים ב-`phoenix-modal.css` הקיים:
- `.phoenix-modal-backdrop`
- `.phoenix-modal`
- `.phoenix-modal__header`
- `.phoenix-modal__title`
- `.phoenix-modal__close`
- `.phoenix-modal__body`
- `.phoenix-modal__footer`
- `.phoenix-modal__save-btn` / `.phoenix-modal__cancel-btn`

### Design Tokens
- `--apple-bg-elevated` - רקע מודול
- `--apple-border-light` - גבולות
- `--color-brand` - צבע כפתור שמירה
- `--spacing-lg` / `--spacing-md` - ריווחים
- `--font-size-base` - גודל טקסט

### RTL Support
כל המודולים תומכים ב-RTL מלא:
- `dir="rtl"` ב-HTML
- יישור כפתורים: `justify-content: flex-end`

### Responsive
- Mobile: `max-width: 100%`, `margin: var(--spacing-md)`
- Desktop: `max-width: 600px` (default) / `max-width: 800px` (large)

---

## 📊 סכמות API

### D18 - Brokers Fees
**שדות:** `broker`, `commission_type`, `commission_value`, `minimum`  
**מקור:** `api/schemas/brokers_fees.py`

### D21 - Cash Flows
**שדות:** `trading_account_id`, `transaction_date`, `flow_type`, `amount`, `currency`, `description`, `subtype`, `status`, `external_reference`  
**מקור:** `api/schemas/cash_flows.py`

---

## 🔧 הערות לצוות 30

### Modal Logic
- **פתיחה/סגירה:** יש לממש באמצעות JavaScript חיצוני
- **data-action attributes:** כל הכפתורים משתמשים ב-`data-action` לזיהוי פעולות
- **Backdrop:** יש לשלוט ב-`display` של ה-backdrop (`flex` / `none`)

### Form Handling
- **ולידציה:** יש לממש ולידציה בצד הלקוח לפני שליחה ל-API
- **שגיאות:** יש להציג שגיאות ב-`.form-error` elements
- **מצבים:** יש לטפל במצבי Add/Edit (מילוי שדות בעריכה)

### Data Attributes
- `data-action="open-modal"` / `data-action="close-modal"` - פתיחה/סגירה
- `data-action="save-broker-fee"` / `data-action="save-cash-flow"` - שמירה
- `data-action="confirm-delete"` / `data-action="confirm-warning"` - אישור
- `data-field="..."` - זיהוי שדות בטופס
- `data-modal-id="..."` - זיהוי מודול ספציפי

---

## 📝 קבצים מעודכנים

- ✅ `modal_add_edit_BLUEPRINT.html`
- ✅ `modal_add_edit_complex_BLUEPRINT.html`
- ✅ `modal_view_details_BLUEPRINT.html`
- ✅ `modal_confirmation_BLUEPRINT.html`
- ✅ `index.html` - עודכן עם קישורים למודולים
- ✅ `MODALS_BLUEPRINT_ANALYSIS.md` - מסמך ניתוח מידע קיים

---

## 🎯 שימוש עתידי

בלופרינטים אלה ישמשו כבסיס לכל המודולים במערכת:
- מודולי CRUD נוספים (Trades, Trade Plans, Watchlists, וכו')
- מודולי הצגת פרטים נוספים
- מודולי אישור נוספים (לפי הצורך)

**עיצוב אחיד:** כל המודולים במערכת ישתמשו באותם CSS classes ואותם עקרונות עיצוב.

---

**מוכן למסירה ל-Visionary לבדיקה ויזואלית ואישור.**

**מקור מנדט:** `TEAM_10_TO_ALL_TEAMS_PROCESS_FORMALIZATION_QA_AND_BLUEPRINT.md`
