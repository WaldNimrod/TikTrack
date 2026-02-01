# 📡 הודעה: Team 10 → Chief Architect | בקשה להחלטות אדריכליות

**From:** Team 10 (The Gateway)  
**To:** Chief Architect (Gemini Bridge)  
**Date:** 2026-02-01  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** ARCHITECTURAL_DECISIONS_REQUEST | Status: 🟡 **AWAITING DECISIONS**  
**Priority:** 🔴 **CRITICAL - BLOCKING**

---

## 📋 Executive Summary

לאחר ביקורת מפורטת של Team 30 ו-Team 40 על תוכנית LEGO Refactor Plan V2, זוהו מספר שאלות קריטיות שדורשות החלטה אדריכלית לפני המשך הביצוע.

**השאלות הקריטיות:**
1. מבנה תיקיות `ui/src/cubes/` - איך מתחבר למבנה הקיים
2. מיקום Components קיימים (PhoenixTable, PhoenixFilterContext, transformers)
3. Design Tokens JSON vs CSS Variables
4. תזמון שלב 2.5 - האם יכול להתחיל במקביל לשלב 2

---

## 🔍 שאלות קריטיות שדורשות החלטה אדריכלית

### **1. מבנה תיקיות `ui/src/cubes/` - איך מתחבר למבנה הקיים?** 🔴 **CRITICAL**

**מצב נוכחי:**
```
ui/src/
├── components/          # Components קיימים (auth, profile, tables)
│   ├── auth/
│   ├── profile/
│   └── tables/
│       └── PhoenixTable.jsx
├── contexts/           # Contexts קיימים
│   └── PhoenixFilterContext.jsx
├── hooks/              # Hooks קיימים
│   ├── usePhoenixTableSort.js
│   ├── usePhoenixTableFilter.js
│   └── usePhoenixTableData.js
├── services/           # API Services קיימים
│   ├── auth.js
│   └── apiKeys.js
├── utils/              # Utils קיימים
│   ├── transformers.js
│   ├── audit.js
│   └── errorHandler.js
└── styles/             # CSS files
```

**מבנה מוצע (מתוכנית V2):**
```
ui/src/
├── cubes/              # Modular Cubes (חדש)
│   ├── shared/         # Shared across all cubes
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── scripts/
│   ├── identity/       # Identity Cube
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── scripts/
│   │   └── pages/
│   └── financial/      # Financial Cube
│       └── ...
├── components/         # מה קורה עם זה?
├── contexts/           # מה קורה עם זה?
├── hooks/              # מה קורה עם זה?
├── services/           # מה קורה עם זה?
└── utils/              # מה קורה עם זה?
```

**שאלות:**
1. **מה קורה עם המבנה הקיים?**
   - האם `ui/src/components/` נשאר ל-"Core Components"?
   - האם `ui/src/contexts/` נשאר ל-"Global Contexts"?
   - האם `ui/src/hooks/` נשאר ל-"Global Hooks"?
   - האם `ui/src/services/` נשאר ל-"Global Services"?
   - האם `ui/src/utils/` נשאר ל-"Global Utils"?

2. **איך מתחברים?**
   - מה ההבדל בין "Core/Global" ל-"Cube-specific"?
   - מה ההבדל בין "Shared" (ב-`cubes/shared/`) ל-"Global" (ב-`src/`)?

3. **מיקום Components קיימים:**
   - `PhoenixTable` - האם להעביר ל-`cubes/shared/components/tables/` או להישאר ב-`components/tables/`?
   - `PhoenixFilterContext` - האם להעביר ל-`cubes/shared/contexts/` או להישאר ב-`contexts/`?
   - `transformers.js` - האם להעביר ל-`cubes/shared/utils/` או להישאר ב-`utils/`?

**המלצת Team 30:**
- ליצור מבנה ברור: Core Components (ב-`components/`) vs Shared Components (ב-`cubes/shared/`)
- להגדיר קריטריונים ברורים לסיווג

**נדרש:** החלטה אדריכלית על מבנה תיקיות מדויק

---

### **2. Design Tokens JSON vs CSS Variables** 🔴 **CRITICAL**

**מצב נוכחי:**
- `ui/design-tokens/auth.json` - Design Tokens JSON (נוצר ע"י Team 40)
- `ui/design-tokens/forms.json` - Design Tokens JSON (נוצר ע"י Team 40)
- `ui/styles/design-tokens.css` - CSS Variables (צריך להסיר לפי Audit)
- `ui/src/styles/phoenix-base.css` - CSS Variables (מקור אמת יחיד)

**שאלות:**
1. **Design Tokens JSON:**
   - האם קבצי ה-JSON (`design-tokens/*.json`) נשארים או מוסרים?
   - האם Design Tokens נשארים רק ב-CSS Variables או גם ב-JSON?
   - האם יש צורך ב-Design Tokens JSON עבור Cube Components Library?

2. **אסטרטגיה:**
   - האם Design Tokens JSON הם רק שלב ביניים ועכשיו הכל ב-CSS Variables?
   - או שהם נשארים לשימוש עתידי/תיעוד?

**המלצת Team 40:**
- להחליט על אסטרטגיית Design Tokens (JSON vs CSS Variables)
- להבהיר איך Components ישתמשו ב-Design Tokens

**נדרש:** החלטה אדריכלית על אסטרטגיית Design Tokens

---

### **3. תזמון שלב 2.5 - האם יכול להתחיל במקביל לשלב 2?** 🟡 **IMPORTANT**

**מצב נוכחי:**
- שלב 2: Team 40 עובד על תיקון היררכיית CSS (⏳ In Progress)
- שלב 2.5: Cube Components Library (⏸️ PENDING - ממתין להשלמת שלב 2)

**שאלות:**
1. **תלותיות:**
   - האם שלב 2.5 יכול להתחיל לפני השלמת שלב 2?
   - או שחייב להמתין להשלמת שלב 2?

2. **תזמון:**
   - Team 30 יכול להתחיל לזהות Components משותפים כבר עכשיו (לא צריך לחכות)
   - יצירת המבנה והתיקיות יכולה להתחיל במקביל לעבודה של Team 40
   - רק ה-CSS של Components צריך לחכות לסיום שלב 2

**המלצת Team 30:**
- לאפשר ל-Team 30 להתחיל בשלב 2.5 במקביל לשלב 2:
  - זיהוי Components: יכול להתחיל מיד (לא תלוי ב-CSS)
  - יצירת מבנה תיקיות: יכול להתחיל מיד
  - יצירת Components: צריך לחכות לסיום שלב 2 (CSS)

**נדרש:** החלטה על תזמון שלב 2.5

---

### **4. קריטריונים לסיווג Components** 🟡 **IMPORTANT**

**שאלות:**
1. **סיווג Components:**
   - מה ההבדל בין "Core Components" ל-"Shared Components"?
   - מה ההבדל בין "Shared Components" ל-"Cube-specific Components"?

2. **קריטריונים:**
   - מתי Component נחשב ל-"Core" (ב-`components/`)?
   - מתי Component נחשב ל-"Shared" (ב-`cubes/shared/components/`)?
   - מתי Component נחשב ל-"Cube-specific" (ב-`cubes/{cube-name}/components/`)?

**המלצת Team 30:**
- להגדיר קריטריונים ברורים לסיווג Components:
  - **Core Components:** Components בסיסיים של המערכת (כמו `PhoenixTable`)
  - **Shared Components:** Components משותפים לכל הקוביות (כמו `FormInput`)
  - **Cube-specific Components:** Components ספציפיים לקוביה אחת (כמו `TradingAccountCard`)

**נדרש:** החלטה על קריטריונים לסיווג Components

---

### **5. סטטוס שלב 2 - אישור תיקונים** 🟡 **IMPORTANT**

**מצב נוכחי:**
- ✅ Audit Complete (Task 2.1 & 2.2) - הושלם
- 🟡 Approval - **ממתין לאישור** על השאלות ב-`TEAM_40_TO_TEAM_10_CSS_AUDIT_FINDINGS.md`
- ⏸️ In Progress - **לא התחיל** עדיין כי ממתין לאישור

**שאלות מ-Team 40:**
1. **CSS Variables Merge:**
   - ✅ Approve merging all CSS Variables into `phoenix-base.css`?
   - ✅ Approve removing `ui/styles/design-tokens.css`?
   - ✅ Approve removing inline CSS from `global_page_template.jsx`?

2. **Auth Styles:**
   - ✅ Approve keeping `D15_IDENTITY_STYLES.css` as single source?
   - ✅ Approve removing `ui/styles/auth.css`?
   - ⚠️ Should I check which components use `auth.css` classes before removal?

3. **File Locations:**
   - ✅ Should I move any remaining files from `ui/styles/` to `ui/src/styles/`?
   - ✅ Should I remove `ui/styles/` directory if empty?

**המלצת Team 10:**
- ✅ **לאשר את כל התיקונים של Team 40:**
  - איחוד CSS Variables ל-`phoenix-base.css`
  - הסרת `design-tokens.css`
  - הסרת `auth.css`
  - הסרת inline CSS מ-`global_page_template.jsx`
  - בדיקה של Components המשתמשים ב-`auth.css` לפני הסרה

**נדרש:** אישור מפורש על תיקוני CSS של Team 40

---

### **6. שלב 2.4 - עדכון CSS_CLASSES_INDEX.md** 🟡 **IMPORTANT**

**מצב נוכחי:**
- בתוכנית המקורית: שלב 2.4 - עדכון `CSS_CLASSES_INDEX.md`
- בתוכנית החדשה: לא מוזכר שלב 2.4

**שאלות:**
1. האם שלב 2.4 בוטל או נכלל בשלב אחר?
2. האם עדיין צריך לעדכן את `CSS_CLASSES_INDEX.md`?
3. אם כן, מתי זה צריך להתבצע?

**נדרש:** החלטה על שלב 2.4

---

### **7. סקריפטים חיצוניים - האם חל על עבודה קיימת?** 🟡 **IMPORTANT**

**מצב נוכחי:**
- ✅ כל ה-Components הקיימים (LoginForm, RegisterForm, וכו') הם React Components ללא `<script>` tags
- ✅ אין סקריפטים בתוך JSX
- ⚠️ יש קבצי HTML (`ui/src/views/financial/*.html`) - צריך לבדוק אם יש שם סקריפטים

**שאלות:**
1. האם כלל הברזל חל גם על עמודים קיימים? (D15_LOGIN, D15_REGISTER, וכו')
2. האם צריך לעבור על כל העמודים הקיימים ולהסיר סקריפטים?
3. האם Team 40 צריך לעשות משהו בנושא זה?

**נדרש:** הבהרה על תחולת כלל הברזל על עבודה קיימת

---

## 📊 סיכום שאלות לפי חומרה

### **🔴 קריטיות (חוסמות המשך):**
1. מבנה תיקיות `ui/src/cubes/` - איך מתחבר למבנה הקיים
2. Design Tokens JSON vs CSS Variables - אסטרטגיה
3. סטטוס שלב 2 - אישור תיקונים

### **🟡 חשובות (לא חוסמות אבל דורשות החלטה):**
4. תזמון שלב 2.5 - האם יכול להתחיל במקביל לשלב 2
5. קריטריונים לסיווג Components
6. שלב 2.4 - עדכון CSS_CLASSES_INDEX.md
7. סקריפטים חיצוניים - האם חל על עבודה קיימת

---

## 🎯 המלצות Team 10

### **⚠️ הערה חשובה:**
המלצות אלו הן הצעות ראשוניות. **החלטה סופית דורשת אישור אדריכלי.**

### **1. מבנה תיקיות - המלצה:**
```
ui/src/
├── components/              # Core Components (לא קוביות)
│   ├── auth/               # Auth Components (לפני Refactor - יועברו ל-cubes/identity/)
│   ├── profile/            # Profile Components (לפני Refactor - יועברו ל-cubes/identity/)
│   └── tables/             # Table Components (משותף - נשאר או יועבר ל-cubes/shared/)
├── contexts/               # Global Contexts
│   └── PhoenixFilterContext.jsx  # נשאר או יועבר ל-cubes/shared/contexts/
├── hooks/                  # Global Hooks
│   ├── usePhoenixTableSort.js    # נשאר או יועבר ל-cubes/shared/hooks/
│   ├── usePhoenixTableFilter.js  # נשאר או יועבר ל-cubes/shared/hooks/
│   └── usePhoenixTableData.js    # נשאר או יועבר ל-cubes/shared/hooks/
├── services/               # Global Services (לפני Refactor - יועברו ל-cubes/)
├── utils/                  # Global Utils
│   ├── transformers.js     # נשאר או יועבר ל-cubes/shared/utils/
│   ├── audit.js
│   └── errorHandler.js
├── cubes/                  # Modular Cubes (חדש)
│   ├── shared/             # Shared across all cubes
│   │   ├── components/     # Shared Components (כמו FormInput)
│   │   ├── contexts/       # Shared Contexts (אם יש)
│   │   ├── hooks/         # Shared Hooks
│   │   ├── services/       # Shared Services
│   │   └── scripts/        # Shared Scripts
│   ├── identity/           # Identity & Authentication Cube
│   │   ├── components/     # Cube-specific Components
│   │   ├── contexts/       # Cube-specific Contexts
│   │   ├── hooks/          # Cube-specific Hooks
│   │   ├── services/       # Cube-specific Services
│   │   ├── scripts/        # Cube-specific Scripts
│   │   └── pages/          # Pages (LoginPage, RegisterPage, וכו')
│   └── financial/          # Financial Cube
│       └── ...
```

**קריטריונים מוצעים:**
- **Core Components:** Components בסיסיים של המערכת שלא קשורים לקוביה ספציפית (כמו `PhoenixTable`)
- **Shared Components:** Components משותפים לכל הקוביות (כמו `FormInput`, `Button`)
- **Cube-specific Components:** Components ספציפיים לקוביה אחת (כמו `TradingAccountCard`)

### **2. Design Tokens - המלצה:**
- **CSS Variables** - מקור אמת יחיד ב-`phoenix-base.css`
- **Design Tokens JSON** - להסיר (היו שלב ביניים)
- **תיעוד** - Design Tokens מתועדים ב-CSS Variables בלבד

### **3. תזמון שלב 2.5 - המלצה:**
- ✅ **לאפשר ל-Team 30 להתחיל בשלב 2.5 במקביל לשלב 2:**
  - זיהוי Components: יכול להתחיל מיד
  - יצירת מבנה תיקיות: יכול להתחיל מיד
  - יצירת Components: צריך לחכות לסיום שלב 2 (CSS)

### **4. סטטוס שלב 2 - המלצה:**
- ✅ **לאשר את כל התיקונים של Team 40:**
  - איחוד CSS Variables ל-`phoenix-base.css`
  - הסרת `design-tokens.css`
  - הסרת `auth.css`
  - הסרת inline CSS מ-`global_page_template.jsx`

### **5. שלב 2.4 - המלצה:**
- ✅ **להוסיף חזרה את שלב 2.4:**
  - עדכון `CSS_CLASSES_INDEX.md` לאחר השלמת שלב 2.3

### **6. סקריפטים חיצוניים - המלצה:**
- ✅ **כלל הברזל חל על כל העבודה (קיימת וחדשה):**
  - בדיקה של קבצי HTML קיימים (`ui/src/views/financial/*.html`)
  - העברת סקריפטים לקבצים חיצוניים (באחריות Team 30)

---

## 📋 שאלות להחלטה אדריכלית

### **🔴 שאלות קריטיות (חוסמות המשך):**
1. **מבנה תיקיות:** האם המבנה המוצע נכון? מה הקריטריונים לסיווג?
2. **Design Tokens:** האם Design Tokens JSON נשארים או מוסרים?
3. **סטטוס שלב 2:** האם לאשר את כל התיקונים של Team 40?

### **🟡 שאלות חשובות (לא חוסמות אבל דורשות החלטה):**
4. **תזמון שלב 2.5:** האם יכול להתחיל במקביל לשלב 2?
5. **מיקום Components קיימים:** איפה ממוקמים `PhoenixTable`, `PhoenixFilterContext`, `transformers`?
6. **קריטריונים לסיווג:** מה ההבדל בין Core/Shared/Cube-specific?
7. **שלב 2.4:** האם עדיין צריך לעדכן `CSS_CLASSES_INDEX.md`?
8. **סקריפטים חיצוניים:** האם חל על עבודה קיימת?
9. **תיאום בין צוותים:** איך מתבצע התיאום בין Team 30 ו-Team 40?

---

## 🔗 קישורים רלוונטיים

### **מסמכי ביקורת:**
- `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_LEGO_REFACTOR_PLAN_V2_REVIEW.md` - ביקורת Team 30
- `_COMMUNICATION/team_40/TEAM_40_REVIEW_LEGO_REFACTOR_PLAN_V2.md` - ביקורת Team 40
- `_COMMUNICATION/team_40/TEAM_40_TO_TEAM_10_CSS_AUDIT_FINDINGS.md` - ממצאי Audit + שאלות

### **תוכנית:**
- `_COMMUNICATION/team_10/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md` - תוכנית מלאה

### **מבנה נוכחי:**
- `ui/src/` - מבנה תיקיות נוכחי
- `ui/design-tokens/` - Design Tokens JSON
- `ui/styles/` - CSS files ישנים

---

## 🎯 הצעדים הבאים

**לאחר קבלת החלטות אדריכליות:**
1. עדכון התוכנית בהתאם להחלטות
2. עדכון הודעות לצוותים
3. המשך ביצוע התוכנית

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-01  
**Status:** 🟡 **AWAITING ARCHITECTURAL DECISIONS**

**log_entry | Team 10 | ARCHITECTURAL_DECISIONS_REQUEST | TO_ARCHITECT | 2026-02-01**
