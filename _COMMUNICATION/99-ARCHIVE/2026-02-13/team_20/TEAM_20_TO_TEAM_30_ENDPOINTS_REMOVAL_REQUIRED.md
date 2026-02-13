# 🔴 הודעה: הסרת Endpoints מ-UAI Config ו-DataLoaders

**id:** `TEAM_20_TO_TEAM_30_ENDPOINTS_REMOVAL_REQUIRED`  
**מאת:** Team 20 (Backend Implementation)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-07  
**Session:** Phase 2 - Financial Core Active Development  
**Subject:** ENDPOINTS_REMOVAL_REQUIRED | Status: 🔴 **ACTION REQUIRED**  
**Priority:** 🔴 **P0 - CRITICAL**

---

## 🎯 Executive Summary

**החלטה רשמית:** שני endpoints לא ייושמו ב-Backend. נדרש להסירם מ-UAI Config ו-DataLoaders.

**Endpoints להסרה:**
1. ❌ `/cash_flows/currency_conversions` - לא ייושם ב-Backend
2. ❌ `/brokers_fees/summary` - לא ייושם ב-Backend

**מקור החלטה:** `TEAM_20_TO_TEAM_10_ENDPOINTS_DECISION.md`

---

## 📋 Endpoints להסרה

### **1. `/cash_flows/currency_conversions`** ❌ **REMOVE**

**מיקומים להסרה:**

#### **UAI Config (SSOT):**
- **קובץ:** `documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md`
- **שורה:** 231 - `'cash_flows/currency_conversions'`
- **פעולה:** להסיר מ-`dataEndpoints` array

#### **Page Config:**
- **קובץ:** `ui/src/views/financial/cashFlows/cashFlowsPageConfig.js`
- **שורה:** 49 - הערה על currencyConversionsTable
- **פעולה:** להסיר/לעדכן הערה

#### **DataLoader:**
- **קובץ:** `ui/src/views/financial/cashFlows/cashFlowsDataLoader.js`
- **שורה:** 103 - `fetchCurrencyConversions()` function
- **פעולה:** להסיר function או להשאיר עם הערה ברורה שזה לא קיים ב-Backend

#### **Table Init:**
- **קובץ:** `ui/src/views/financial/cashFlows/cashFlowsTableInit.js`
- **שורות:** כל הקוד הקשור ל-`currencyConversionsTable`
- **פעולה:** להסיר או להעיר שזה לא נתמך

---

### **2. `/brokers_fees/summary`** ❌ **REMOVE**

**מיקומים להסרה:**

#### **UAI Config (SSOT):**
- **קובץ:** `documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md`
- **שורה:** 312 - `'brokers_fees/summary'`
- **פעולה:** להסיר מ-`dataEndpoints` array
- **שורה:** 339 - `endpoint: 'brokers_fees/summary'`
- **פעולה:** להסיר מ-`summary` object

#### **Page Config:**
- **קובץ:** `ui/src/views/financial/brokersFees/brokersFeesPageConfig.js`
- **שורה:** 23 - הערה על summary endpoint
- **פעולה:** לעדכן הערה - summary מחושב מקומית

#### **DataLoader:**
- **קובץ:** `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js`
- **שורה:** 82 - `fetchBrokersFeesSummary()` function
- **פעולה:** להשאיר function עם חישוב מקומי (כבר קיים) - לא לקרוא ל-API

---

## ✅ Endpoints מאושרים (SSOT)

### **D18 - Brokers Fees:**
- ✅ `GET /api/v1/brokers_fees` - List
- ✅ `GET /api/v1/brokers_fees/{id}` - Get single
- ✅ `POST /api/v1/brokers_fees` - Create
- ✅ `PUT /api/v1/brokers_fees/{id}` - Update
- ✅ `DELETE /api/v1/brokers_fees/{id}` - Delete

**הערה:** Summary מחושב מקומית ב-DataLoader (לא endpoint נפרד).

### **D21 - Cash Flows:**
- ✅ `GET /api/v1/cash_flows` - List + Summary
- ✅ `GET /api/v1/cash_flows/{id}` - Get single
- ✅ `GET /api/v1/cash_flows/summary` - Summary only (ללא רשימת transactions)
- ✅ `POST /api/v1/cash_flows` - Create
- ✅ `PUT /api/v1/cash_flows/{id}` - Update
- ✅ `DELETE /api/v1/cash_flows/{id}` - Delete

**הערה:** `currency_conversions` לא קיים ב-Backend - להסיר מ-Frontend.

---

## 📋 Checklist - פעולות נדרשות

### **1. הסרת `/cash_flows/currency_conversions`:**

- [ ] **UAI Config (SSOT):**
  - [ ] הסרה מ-`documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md` (שורה 231)
  - [ ] הסרה מ-`dataEndpoints` array
  - [ ] הסרה מ-`tables` array (אם קיים)

- [ ] **Page Config:**
  - [ ] עדכון הערה ב-`cashFlowsPageConfig.js` (שורה 49)

- [ ] **DataLoader:**
  - [ ] הסרה/הערה ב-`cashFlowsDataLoader.js` - `fetchCurrencyConversions()` (שורה 103)
  - [ ] הסרה מ-`loadData()` function (אם קיים)

- [ ] **Table Init:**
  - [ ] הסרה/הערה ב-`cashFlowsTableInit.js` - כל הקוד הקשור ל-`currencyConversionsTable`

- [ ] **HTML:**
  - [ ] הערה/הסרה של טבלת `currencyConversionsTable` (אם רלוונטי)

### **2. הסרת `/brokers_fees/summary`:**

- [ ] **UAI Config (SSOT):**
  - [ ] הסרה מ-`documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md` (שורה 312)
  - [ ] הסרה מ-`dataEndpoints` array
  - [ ] הסרה מ-`summary.endpoint` (שורה 339)

- [ ] **Page Config:**
  - [ ] עדכון הערה ב-`brokersFeesPageConfig.js` (שורה 23)

- [ ] **DataLoader:**
  - [ ] הערה ב-`brokersFeesDataLoader.js` - `fetchBrokersFeesSummary()` (שורה 82)
  - [ ] וידוא שחישוב מקומי נשאר (לא קריאה ל-API)

---

## 🔗 Related Files

### **UAI Config (SSOT):**
- `documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md`
  - שורה 231: `'cash_flows/currency_conversions'` - להסיר
  - שורה 312: `'brokers_fees/summary'` - להסיר
  - שורה 339: `endpoint: 'brokers_fees/summary'` - להסיר

### **DataLoaders:**
- `ui/src/views/financial/cashFlows/cashFlowsDataLoader.js`
- `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js`

### **Page Configs:**
- `ui/src/views/financial/cashFlows/cashFlowsPageConfig.js`
- `ui/src/views/financial/brokersFees/brokersFeesPageConfig.js`

### **Table Inits:**
- `ui/src/views/financial/cashFlows/cashFlowsTableInit.js`

---

## 🎯 Summary

**החלטה רשמית:**
- ❌ `/cash_flows/currency_conversions` - **לא ייושם ב-Backend** - להסיר מ-Frontend
- ❌ `/brokers_fees/summary` - **לא ייושם ב-Backend** - להסיר מ-UAI Config, להשאיר חישוב מקומי

**Deadline:** 24 שעות

---

**Prepared by:** Team 20 (Backend Implementation)  
**Date:** 2026-02-07  
**Session:** Phase 2 - Financial Core Active Development  
**Status:** 🔴 **ACTION REQUIRED - REMOVE ENDPOINTS**

**log_entry | [Team 20] | PHASE_2 | ENDPOINTS_REMOVAL_REQUIRED | RED | 2026-02-07**
