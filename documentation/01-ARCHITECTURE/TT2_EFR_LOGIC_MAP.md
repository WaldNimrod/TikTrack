# EFR Logic Map - SSOT Field Mapping Table

**id:** `TT2_EFR_LOGIC_MAP`  
**owner:** Team 10 (The Gateway) - SSOT  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** `TEAM_30_EFR_LOGIC_MAP.md` (promoted from Communication)  
**last_updated:** 2026-02-07  
**version:** v1.0.0 (Promoted to SSOT)

---

## 📢 Executive Summary

**EFR Logic Map** הוא טבלת SSOT (Single Source of Truth) למיפוי שדות בטבלאות. הטבלה מגדירה את הקשר בין שדות Backend (snake_case) לשדות Frontend (camelCase) ולסוגי הרינדור ב-EFR.

**למה נחוץ:**
- מיפוי מרכזי של כל השדות במערכת
- הבטחת עקביות בין Backend ל-Frontend
- תמיכה ב-EFR לזיהוי אוטומטי של סוג רינדור
- מניעת טעויות במיפוי שדות

**חובה:** כל שדה בטבלה חייב להיות מוגדר בטבלה זו לפני שימוש ב-EFR.

---

## 🎯 Purpose & Goals

### **מטרות עיקריות:**
- **מיפוי מרכזי:** מקור אמת אחד לכל מיפויי השדות
- **עקביות:** הבטחת עקביות בין Backend ל-Frontend
- **אוטומציה:** תמיכה בזיהוי אוטומטי של סוג רינדור
- **תיעוד:** תיעוד מלא של כל השדות במערכת

### **בעיות שהמערכת פותרת:**
- **טעויות מיפוי:** שדות לא ממופים או ממופים שגוי
- **חוסר עקביות:** מיפויים שונים לאותם שדות
- **קושי בתחזוקה:** שינוי מיפוי דורש חיפוש בקוד
- **חוסר תיעוד:** אין מקור מרכזי למיפויי שדות

---

## 📋 SSOT Field Mapping Table

### **Table Structure:**

| Backend Field (snake_case) | Frontend Field (camelCase) | Field Type | EFR Renderer | Format Options | Example Value | Notes |
|:---|:---|:---|:---|:---|:---|:---|
| `id` | `id` | string | - | - | `"01ARZ3NDEKTSV4RRFFQ69G5FAV"` | ULID string |
| `external_ulid` | `externalUlid` | string | - | - | `"01ARZ3NDEKTSV4RRFFQ69G5FAV"` | ULID string |
| `amount` | `amount` | number | CurrencyRenderer | `{ currency, showSign, decimals }` | `1234.56` | Financial amount |
| `balance` | `balance` | number | CurrencyRenderer | `{ currency, showSign, decimals }` | `50000.00` | Account balance |
| `price` | `price` | number | CurrencyRenderer | `{ currency, decimals: 2 }` | `155.34` | Current price |
| `total` | `total` | number | CurrencyRenderer | `{ currency, showSign, decimals }` | `10000.00` | Total amount |
| `value` | `value` | number | CurrencyRenderer | `{ currency, showSign, decimals }` | `5000.00` | Generic value |
| `quantity` | `quantity` | number | NumericRenderer | `{ decimals: 0 }` | `100` | Share quantity |
| `cost` | `cost` | number | CurrencyRenderer | `{ currency, showSign, decimals }` | `15000.00` | Cost amount |
| `fee` | `fee` | number | CurrencyRenderer | `{ currency, showSign, decimals }` | `5.50` | Fee amount |
| `commission` | `commission` | number | CurrencyRenderer | `{ currency, showSign, decimals }` | `10.00` | Commission amount |
| `profit` | `profit` | number | CurrencyRenderer | `{ currency, showSign, decimals }` | `500.00` | Profit amount |
| `loss` | `loss` | number | CurrencyRenderer | `{ currency, showSign, decimals }` | `-200.00` | Loss amount |
| `equity` | `equity` | number | CurrencyRenderer | `{ currency, showSign, decimals }` | `50000.00` | Equity value |
| `margin` | `margin` | number | CurrencyRenderer | `{ currency, showSign, decimals }` | `10000.00` | Margin amount |
| `date` | `date` | date | DateRenderer | `{ format: 'DD/MM/YYYY' }` | `"2026-02-01"` | Date field |
| `created_at` | `createdAt` | date | DateRenderer | `{ format: 'DD/MM/YYYY' }` | `"2026-02-01T10:30:00Z"` | Creation date |
| `updated_at` | `updatedAt` | date | DateRenderer | `{ format: 'DD/MM/YYYY HH:mm' }` | `"2026-02-01T14:45:00Z"` | Update date |
| `status` | `status` | string | StatusRenderer | `{ category }` | `"active"` | Status field |
| `type` | `type` | string | BadgeRenderer | `{ type: 'operation', operationType }` | `"deposit"` | Operation type |
| `commission_type` | `commissionType` | string | BadgeRenderer | `{ type: 'commission' }` | `"tiered"` | Commission type |
| `name` | `name` | string | - | - | `"IBKR - Main"` | Name field |
| `description` | `description` | string | - | - | `"הפקדה ראשונית"` | Description field |
| `currency` | `currency` | string | - | - | `"USD"` | Currency code |
| `from_currency` | `fromCurrency` | string | - | - | `"USD"` | Source currency |
| `to_currency` | `toCurrency` | string | - | - | `"EUR"` | Target currency |
| `from_amount` | `fromAmount` | number | CurrencyRenderer | `{ currency: fromCurrency, showSign: false }` | `5000.00` | Source amount |
| `to_amount` | `toAmount` | number | CurrencyRenderer | `{ currency: toCurrency, showSign: true }` | `4550.00` | Target amount |
| `estimated_rate` | `estimatedRate` | number | NumericRenderer | `{ decimals: 2 }` | `0.91` | Exchange rate |
| `identification` | `identification` | string | - | - | `"CONV-2026-001"` | Identification code |
| `broker` | `broker` | string | - | - | `"IBKR"` | Broker name |
| `commission_value` | `commissionValue` | string | - | `{ commissionType }` | `"0.0035"` | Commission value |
| `minimum` | `minimum` | number | CurrencyRenderer | `{ currency: 'USD', decimals: 2 }` | `10.00` | Minimum amount |
| `trading_account_id` | `tradingAccountId` | string | - | - | `"01ARZ3NDEKTSV4RRFFQ69G5FAV"` | Trading account ID |
| `account` | `account` | string | - | - | `"IBKR - Main"` | Account name |
| `source` | `source` | string | - | - | `"העברה בנקאית"` | Source description |
| `trade` | `trade` | string | - | - | `"AAPL"` | Trade symbol |

---

## 🔍 Field Type Definitions

### **Field Types:**

#### **1. Financial Fields (CurrencyRenderer):**
- `amount`, `balance`, `price`, `total`, `value`, `cost`, `fee`, `commission`, `profit`, `loss`, `equity`, `margin`
- **Renderer:** `CurrencyRenderer`
- **Default Options:** `{ currency: 'USD', showSign: false, decimals: 2 }`
- **Special Cases:**
  - `amount` in cash flows: `showSign: true` (shows +/-)
  - `profit`/`loss`: `showSign: true` (always shows sign)
  - `from_amount`/`to_amount`: uses respective currency

#### **2. Date Fields (DateRenderer):**
- `date`, `created_at`, `updated_at`
- **Renderer:** `DateRenderer`
- **Default Options:** `{ format: 'DD/MM/YYYY' }`
- **Special Cases:**
  - `updated_at`: `{ format: 'DD/MM/YYYY HH:mm' }` (includes time)

#### **3. Status Fields (StatusRenderer):**
- `status`
- **Renderer:** `StatusRenderer`
- **Default Options:** `{ category: 'active' }`
- **Categories:** `active`, `inactive`, `pending`, `cancelled`

#### **4. Badge Fields (BadgeRenderer):**
- `type`, `commission_type`
- **Renderer:** `BadgeRenderer`
- **Default Options:**
  - `type`: `{ type: 'operation', operationType: value }`
  - `commission_type`: `{ type: 'commission', category: value }`

#### **5. Numeric Fields (NumericRenderer):**
- `quantity`, `estimated_rate`
- **Renderer:** `NumericRenderer`
- **Default Options:** `{ decimals: 0 }` (or `2` for rates)

#### **6. String Fields (No Renderer):**
- `id`, `external_ulid`, `name`, `description`, `currency`, `broker`, `account`, `source`, `trade`, `identification`
- **Renderer:** None (plain text)
- **Display:** Direct text content

---

## 📊 Table-Specific Mappings

### **Cash Flows Table:**

| Column | Backend Field | Frontend Field | EFR Renderer | Options |
|:---|:---|:---|:---|:---|
| טרייד | `trade` | `trade` | - | Plain text |
| חשבון מסחר | `account` | `account` | - | Plain text |
| סוג | `type` | `type` | BadgeRenderer | `{ type: 'operation', operationType }` |
| סכום | `amount` | `amount` | CurrencyRenderer | `{ currency, showSign: true, decimals: 2 }` |
| תאריך | `date` | `date` | DateRenderer | `{ format: 'DD/MM/YYYY' }` |
| תיאור | `description` | `description` | - | Plain text |
| מקור | `source` | `source` | - | Plain text |
| עודכן | `updated_at` | `updatedAt` | DateRenderer | `{ format: 'DD/MM/YYYY HH:mm' }` |

### **Currency Conversions Table:**

| Column | Backend Field | Frontend Field | EFR Renderer | Options |
|:---|:---|:---|:---|:---|
| תאריך | `date` | `date` | DateRenderer | `{ format: 'DD/MM/YYYY' }` |
| חשבון מסחר | `account` | `account` | - | Plain text |
| מה־ | `from_amount` | `fromAmount` | CurrencyRenderer | `{ currency: fromCurrency, showSign: false }` |
| ל־ | `to_amount` | `toAmount` | CurrencyRenderer | `{ currency: toCurrency, showSign: true }` |
| שער משוער | `estimated_rate` | `estimatedRate` | NumericRenderer | `{ decimals: 2 }` |
| זיהוי | `identification` | `identification` | - | Plain text |

### **Brokers Fees Table:**

| Column | Backend Field | Frontend Field | EFR Renderer | Options |
|:---|:---|:---|:---|:---|
| ברוקר | `broker` | `broker` | - | Plain text |
| סוג עמלה | `commission_type` | `commissionType` | BadgeRenderer | `{ type: 'commission' }` |
| ערך עמלה | `commission_value` | `commissionValue` | - | `{ commissionType }` (formatted) |
| מינימום לפעולה | `minimum` | `minimum` | CurrencyRenderer | `{ currency: 'USD', decimals: 2 }` |

---

## 🔄 Usage in EFR

### **Automatic Field Detection:**

```javascript
// EFR automatically detects field type from Logic Map
class EFRCore {
  renderField(fieldName, value, data) {
    // Look up field in Logic Map
    const fieldMapping = EFRLogicMap.get(fieldName);
    
    if (!fieldMapping) {
      // Fallback: render as plain text
      return this.renderPlainText(value);
    }
    
    // Use mapped renderer
    const renderer = this.renderers[fieldMapping.renderer];
    const options = this.buildOptions(fieldMapping, data);
    
    return renderer.render(value, options, this.formatters);
  }
  
  buildOptions(fieldMapping, data) {
    const options = { ...fieldMapping.defaultOptions };
    
    // Resolve dynamic options (e.g., currency from data)
    if (options.currency === 'fromCurrency') {
      options.currency = data.fromCurrency || 'USD';
    }
    
    return options;
  }
}
```

### **Manual Override:**

```javascript
// Manual override if needed
const element = EFR.render('amount', 1234.56, {
  currency: 'EUR', // Override default USD
  showSign: true,
  decimals: 3 // Override default 2
});
```

---

## ✅ Checklist

### **For Each Field:**

- [ ] Field מוגדר בטבלת Logic Map
- [ ] Backend field (snake_case) מוגדר
- [ ] Frontend field (camelCase) מוגדר
- [ ] Field type מוגדר
- [ ] EFR Renderer מוגדר (אם נדרש)
- [ ] Format options מוגדרים
- [ ] Example value מוגדר

### **For Each Table:**

- [ ] כל העמודות ממופות
- [ ] כל ה-renderers מוגדרים
- [ ] כל ה-options מוגדרים
- [ ] טבלה מתועדת בסעיף Table-Specific Mappings

---

## 📞 קישורים רלוונטיים

- **EFR Spec:** `_COMMUNICATION/team_30/TEAM_30_EFR_SPEC.md`
- **Transformers SSOT:** `ui/src/cubes/shared/utils/transformers.js`
- **Table Formatters SSOT:** `ui/src/cubes/shared/tableFormatters.js`

---

**Team 30 (Frontend Execution)**  
**תאריך:** 2026-01-31  
**סטטוס:** 🔴 **CRITICAL - SSOT**  
**Deadline:** 2026-02-07 (18 hours)

**log_entry | [Team 30] | EFR_LOGIC_MAP | CRITICAL_SSOT | 2026-01-31**
