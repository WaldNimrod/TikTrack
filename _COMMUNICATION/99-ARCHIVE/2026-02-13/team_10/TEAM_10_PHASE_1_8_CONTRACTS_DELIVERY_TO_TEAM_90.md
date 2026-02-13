# 📋 הגשת חוזים לביקורת: Phase 1.8 - Team 90

**מאת:** Team 10 (The Gateway)  
**אל:** Team 90 (Spy Team - Quality Gate)  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **MANDATORY - 48 HOURS DEADLINE**  
**עדיפות:** 🔴 **P0 - CRITICAL**

---

## 🎯 Executive Summary

**תוכנית הגשת חוזים ל-Team 90 לביקורת תוך 48 שעות מתחילת Phase 1.8.**

**מקור:** `ARCHITECT_PHASE_1_8_DETAILED_STRATEGY.md`

---

## 📋 חוזים נדרשים להגשה (48 שעות)

### **1. PDSC Boundary Contract** 🔴 **CRITICAL**

**קובץ:** `_COMMUNICATION/team_20/TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md`

**דרישות:**
- [ ] מסמך Interface Definition נפרד מלא
- [ ] Error Schema (JSON Schema Definition)
- [ ] Response Contract (Success + Error formats)
- [ ] Transformers Integration (אחריות ברורה)
- [ ] Fetching Integration (אחריות ברורה)
- [ ] Routes SSOT Integration (אחריות ברורה)
- [ ] דוגמאות קוד משותפות (Backend + Frontend)
- [ ] Integration Examples (End-to-End)
- [ ] Validation Rules מוסכמים

**צוותים:** Team 20 + Team 30

**Timeline:** 24 שעות (לאחר סשן חירום)

**Deadline:** 48 שעות מתחילת Phase 1.8

---

### **2. UAI External JS Contract** 🔴 **CRITICAL**

**קובץ:** `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md`

**דרישות:**
- [ ] הסרת כל דוגמאות עם inline `<script>`
- [ ] הגדרת פורמט SSOT: קובץ JS חיצוני (`pageConfig.js`)
- [ ] עדכון כל הדוגמאות (Cash Flows, Brokers Fees)
- [ ] עדכון Integration examples
- [ ] עדכון Validation function
- [ ] איחוד naming: `window.UAI.config` (לא `window.UAIConfig`)
- [ ] איחוד naming: `brokers_fees` (לא `brokers`)

**צוות:** Team 30

**Timeline:** 12 שעות

**Deadline:** 48 שעות מתחילת Phase 1.8

---

## ✅ Checklist הגשה

### **לפני הגשה:**

#### **PDSC Boundary Contract:**
- [ ] סשן חירום Team 20 + Team 30 הושלם
- [ ] כל הנושאים מוסכמים
- [ ] דוגמאות קוד משותפות נוספו
- [ ] תיעוד Integration Points הושלם
- [ ] Validation Rules מוסכמים

#### **UAI External JS Contract:**
- [ ] כל דוגמאות inline JS הוסרו
- [ ] כל דוגמאות external JS נוספו
- [ ] naming מאוחד (`window.UAI.config`, `brokers_fees`)
- [ ] Validation function מעודכן

---

### **הגשה ל-Team 90:**

**קבצים להגשה:**
- [ ] `_COMMUNICATION/team_20/TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` (מושלם)
- [ ] `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md` (מתוקן)

**תיעוד נוסף:**
- [ ] דוגמאות קוד Backend (Python/Pydantic)
- [ ] דוגמאות קוד Frontend (JavaScript)
- [ ] Integration Examples (End-to-End)

---

## 🎯 Timeline הגשה

### **48 שעות מתחילת Phase 1.8:**

**שעות 0-8:**
- סשן חירום Team 20 + Team 30

**שעות 8-24:**
- השלמת PDSC Boundary Contract
- תיקון UAI External JS Contract (חלק 1)

**שעות 24-36:**
- תיקון UAI External JS Contract (חלק 2)
- בדיקת תקינות

**שעות 36-48:**
- הגשה ל-Team 90 לביקורת

---

## ⚠️ אזהרות קריטיות

1. **Deadline חובה** - 48 שעות מתחילת Phase 1.8
2. **PDSC Boundary Contract חובה** - לא ניתן להתחיל מימוש ללא חוזה מושלם
3. **UAI External JS Contract חובה** - לא ניתן להתחיל Retrofit ללא External JS

---

## 📞 תמיכה מ-Team 10

**Team 10 זמין לתמיכה:**
- תיאום סשן חירום
- אישור החלטות
- בדיקת תאימות
- הגשה ל-Team 90 לביקורת

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **MANDATORY - 48 HOURS DEADLINE**

**log_entry | [Team 10] | PHASE_1_8 | CONTRACTS_DELIVERY | RED | 2026-02-07**
