# ⚠️ עדכון נדרש: Routes - Team 20

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend Implementation)  
**תאריך:** 2026-02-05  
**סטטוס:** ⚠️ **ACTION REQUIRED**  
**מקור:** שינויי Frontend לפי פסיקה אדריכלית

---

## 📢 Executive Summary

לפי פסיקה אדריכלית סופית (`ARCHITECT_RESOLUTION_NAMING_FINAL.md`), Team 30 עדכנה את נתיבי ה-UI לרבים. נדרש עדכון מתאים בצד השרת.

---

## 🔄 שינויים שבוצעו ב-Frontend

Team 30 ביצעה את השינויים הבאים:

1. ✅ `/trade_plans` → `/trades_plans`
2. ✅ `/trade_history` → `/trades_history`

**קבצים שעודכנו:**
- `ui/src/views/shared/unified-header.html` - נתיבים עודכנו
- `ui/src/components/core/headerLinksUpdater.js` - נתיבים עודכנו

---

## ⚠️ פעולות נדרשות מ-Team 20

### **1. עדכון Routes ב-Backend** ⚠️ **REQUIRED**

**נתיבים שצריך לעדכן:**
- `/trade_plans` → `/trades_plans`
- `/trade_history` → `/trades_history`

**קבצים לבדיקה:**
- כל קבצי API routes
- כל קבצי Router definitions
- כל קבצי OpenAPI Specification

---

### **2. אימות עקביות** ⚠️ **REQUIRED**

יש לוודא ש:
- ✅ כל ה-Routes ב-Backend תואמים לנתיבים החדשים ב-Frontend
- ✅ כל ה-API endpoints ברבים כנדרש בפסיקה האדריכלית
- ✅ כל ה-OpenAPI Specification עודכן בהתאם

---

## 📋 הנחיות לפי הפסיקה האדריכלית

לפי `ARCHITECT_RESOLUTION_NAMING_FINAL.md`:

1. **Entity Names (Plural Always):** כל התייחסות לישות עצמה ב-UI, ב-Data Attributes, ב-CSS Variables ובנתיבי API (Paths) תהיה ב**רבים**.
   * דוגמאות: `/trades_plans`, `/trades_history`, `/trading_accounts`

2. **Identification (Singular Always):** מזהים ייחודיים (IDs) ופרמטרים של שאילתות (Query Params) יישארו ב**יחיד**.
   * דוגמאות מאושרות: `trading_account_id`, `trade_id`, `user_id`

---

## ⏱️ זמן משוער

**1-2 שעות**

---

## ✅ קריטריוני השלמה

- ✅ כל ה-Routes עודכנו לרבים (`/trades_plans`, `/trades_history`)
- ✅ כל ה-API endpoints ברבים
- ✅ כל ה-OpenAPI Specification עודכן
- ✅ אימות עקביות בין Frontend ל-Backend

---

## 📁 קבצים רלוונטיים

### **מסמכים:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_RESOLUTION_NAMING_FINAL.md` - פסיקה אדריכלית סופית
- `_COMMUNICATION/team_10/TEAM_30_NAMING_RESOLUTION_COMPLETION_REPORT.md` - דוח השלמה של Team 30

### **קבצים לבדיקה:**
- כל קבצי API routes
- כל קבצי Router definitions
- `documentation/07-CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml` - OpenAPI Specification

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-05  
**סטטוס:** ⚠️ **ACTION REQUIRED**

**log_entry | [Team 10] | ROUTES_UPDATE | TEAM_20 | ACTION_REQUIRED | YELLOW | 2026-02-05**
