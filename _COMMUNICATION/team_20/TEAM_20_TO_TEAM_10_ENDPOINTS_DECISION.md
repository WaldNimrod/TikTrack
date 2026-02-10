# 🔴 החלטת Backend/SSOT: Endpoints חסרים

**id:** `TEAM_20_TO_TEAM_10_ENDPOINTS_DECISION`  
**מאת:** Team 20 (Backend Implementation)  
**אל:** Team 10 (The Gateway) + Team 30 (Frontend Execution)  
**תאריך:** 2026-02-07  
**Session:** Phase 2 - Financial Core Active Development  
**Subject:** ENDPOINTS_DECISION | Status: 🔴 **DECISION REQUIRED**  
**Priority:** 🔴 **P0 - CRITICAL**

---

## 🎯 Executive Summary

**החלטה רשמית על endpoints חסרים ב-Backend:**

1. ❌ **`/cash_flows/currency_conversions`** - **לא ייושם ב-Backend**
2. ❌ **`/brokers_fees/summary`** - **לא ייושם ב-Backend**

**החלטה:** Frontend בלבד - להסיר מ-UAI config ו-DataLoaders.

---

## 📋 ניתוח Endpoints חסרים

### **1. `/cash_flows/currency_conversions`** ❌ **NOT IMPLEMENTED**

**מצב נוכחי:**
- ❌ לא קיים ב-Backend API
- ✅ קיים ב-UAI Config (`TT2_UAI_CONFIG_CONTRACT.md` - שורה 231)
- ✅ קיים ב-DataLoader (`cashFlowsDataLoader.js` - שורה 103)
- ✅ DataLoader מחזיר empty data כי endpoint לא קיים

**ניתוח:**
- אין טבלת DB נפרדת ל-currency_conversions
- אין Model, Schema, Service, Router ב-Backend
- לא מוגדר ב-Mandate (`TEAM_10_TO_TEAM_20_PHASE_2_EXECUTION_D18_D21.md`)
- לא חלק מ-SSOT

**החלטה:** ❌ **לא ייושם ב-Backend**

**פעולות נדרשות:**
- [ ] Team 30: להסיר מ-UAI Config (`cash_flows/currency_conversions`)
- [ ] Team 30: להסיר מ-DataLoader (`fetchCurrencyConversions`)
- [ ] Team 30: להסיר מ-HTML (טבלת currencyConversionsTable)

---

### **2. `/brokers_fees/summary`** ❌ **NOT IMPLEMENTED**

**מצב נוכחי:**
- ❌ לא קיים ב-Backend API
- ✅ קיים ב-UAI Config (`TT2_UAI_CONFIG_CONTRACT.md` - שורה 312)
- ✅ קיים ב-DataLoader (`brokersFeesDataLoader.js` - שורה 82)
- ✅ DataLoader מחשב summary מקומית (שורה 84-94)

**ניתוח:**
- אין צורך ב-endpoint נפרד - summary פשוט (totalBrokers, activeBrokers)
- לא מוגדר ב-Mandate (`TEAM_10_TO_TEAM_20_PHASE_2_EXECUTION_D18_D21.md`)
- לא חלק מ-SSOT
- DataLoader כבר מחשב summary מקומית

**החלטה:** ❌ **לא ייושם ב-Backend**

**פעולות נדרשות:**
- [ ] Team 30: להסיר מ-UAI Config (`brokers_fees/summary`)
- [ ] Team 30: להשאיר חישוב מקומי ב-DataLoader (כבר קיים)

---

## ✅ Endpoints מאושרים (SSOT)

### **D18 - Brokers Fees:**
- ✅ `GET /api/v1/brokers_fees` - List
- ✅ `GET /api/v1/brokers_fees/{id}` - Get single
- ✅ `POST /api/v1/brokers_fees` - Create
- ✅ `PUT /api/v1/brokers_fees/{id}` - Update
- ✅ `DELETE /api/v1/brokers_fees/{id}` - Delete

### **D21 - Cash Flows:**
- ✅ `GET /api/v1/cash_flows` - List + Summary
- ✅ `GET /api/v1/cash_flows/{id}` - Get single
- ✅ `GET /api/v1/cash_flows/summary` - Summary only
- ✅ `POST /api/v1/cash_flows` - Create
- ✅ `PUT /api/v1/cash_flows/{id}` - Update
- ✅ `DELETE /api/v1/cash_flows/{id}` - Delete

**הערה:** `GET /api/v1/cash_flows/summary` **קיים** - זה endpoint נפרד ל-summary בלבד (ללא רשימת transactions).

---

## 📋 פעולות נדרשות

### **Team 30 (Frontend):**

#### **1. הסרת `/cash_flows/currency_conversions`:**
- [ ] הסרה מ-UAI Config (`TT2_UAI_CONFIG_CONTRACT.md` - שורה 231)
- [ ] הסרה מ-`cashFlowsPageConfig.js` (אם קיים)
- [ ] הסרה/הערה ב-`cashFlowsDataLoader.js` - `fetchCurrencyConversions()` (שורה 103)
- [ ] הסרה מ-HTML - טבלת `currencyConversionsTable` (אם רלוונטי)

#### **2. הסרת `/brokers_fees/summary`:**
- [ ] הסרה מ-UAI Config (`TT2_UAI_CONFIG_CONTRACT.md` - שורה 312)
- [ ] הסרה מ-`brokersFeesPageConfig.js` (אם קיים)
- [ ] הערה ב-`brokersFeesDataLoader.js` - `fetchBrokersFeesSummary()` (שורה 82) - להשאיר חישוב מקומי

---

## 🔗 Related Files

### **UAI Config (SSOT):**
- `documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md`
  - שורה 231: `'cash_flows/currency_conversions'` - להסיר
  - שורה 312: `'brokers_fees/summary'` - להסיר

### **DataLoaders:**
- `ui/src/views/financial/cashFlows/cashFlowsDataLoader.js` - שורה 103
- `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js` - שורה 82

### **Page Configs:**
- `ui/src/views/financial/cashFlows/cashFlowsPageConfig.js`
- `ui/src/views/financial/brokersFees/brokersFeesPageConfig.js`

---

## 🎯 Summary

**החלטה רשמית:**
- ❌ `/cash_flows/currency_conversions` - **לא ייושם ב-Backend**
- ❌ `/brokers_fees/summary` - **לא ייושם ב-Backend**

**פעולות:**
- Team 30: להסיר מ-UAI Config ו-DataLoaders
- Team 20: לא נדרש שינוי (endpoints לא קיימים)

---

**Prepared by:** Team 20 (Backend Implementation)  
**Date:** 2026-02-07  
**Session:** Phase 2 - Financial Core Active Development  
**Status:** 🔴 **DECISION MADE - AWAITING FRONTEND REMOVAL**

**log_entry | [Team 20] | PHASE_2 | ENDPOINTS_DECISION | RED | 2026-02-07**
