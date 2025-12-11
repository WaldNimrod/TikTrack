# תוכנית יישום מערכת AI Analysis - TikTrack

**תאריך יצירה:** 28 בינואר 2025  
**גרסה:** 1.0.0  
**סטטוס:** 📋 תוכנית ראשונית - ממתין לאישור

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [שלב 0: דוקומנטציה מלאה](#שלב-0-דוקומנטציה-מלאה)
3. [תבניות הפרומפטים](#תבניות-הפרומפטים)
4. [ארכיטקטורה מלאה](#ארכיטקטורה-מלאה)
5. [אינטגרציה עם מערכות קיימות](#אינטגרציה-עם-מערכות-קיימות)
6. [מבנה עמודים לפי ITCSS](#מבנה-עמודים-לפי-itcss)
7. [מערכת איתחול וטעינה](#מערכת-איתחול-וטעינה)
8. [מערכת עריכה של תבניות](#מערכת-עריכה-של-תבניות)
9. [בדיקות מקיפות](#בדיקות-מקיפות)
10. [שלבי יישום](#שלבי-יישום)

---

## 🎯 סקירה כללית

### מטרת המערכת

יישום מערכת AI לניתוח מניות עם תמיכה ב-4 תבניות פרומפטים, אינטגרציה עם מנועי LLM (Perplexity/Gemini), ניהול API keys למשתמשים, והצגת תוצאות כולל אינפוגרפיקות.

### עקרונות יסוד

1. **אינטגרציה מלאה** - שימוש בכל המערכות הקיימות במערכת
2. **ITCSS מדויק** - ללא inline styles או styles בתוך HTML
3. **מערכת כפתורים מרכזית** - כל הכפתורים דרך `data-onclick`
4. **צבעים דינמיים** - שימוש במערכת הצבעים הדינמיים מהעדפות
5. **רינדור מרכזי** - שימוש ב-FieldRendererService ורינדור מרכזי
6. **איתחול מדויק** - שימוש במערכת האיתחול המאוחדת
7. **עריכה קלה** - מבנה המאפשר עריכה נוחה של תבניות

---

## 📚 שלב 0: דוקומנטציה מלאה

### 0.1 מדריך מפתחים מקיף

**קובץ:** `documentation/04-FEATURES/AI_ANALYSIS_SYSTEM_DEVELOPER_GUIDE.md`

**תוכן:**

- ארכיטקטורה מלאה של המערכת
- זרימת נתונים מפורטת (Frontend ↔ Backend ↔ LLM)
- API Reference מלא (כל ה-endpoints)
- דוגמאות קוד לכל השימושים
- Best Practices ו-Gotchas
- Troubleshooting Guide
- Integration Points עם מערכות קיימות

### 0.2 דוקומנטציה למשתמש

**קובץ:** `documentation/04-FEATURES/AI_ANALYSIS_SYSTEM_USER_GUIDE.md`

**תוכן:**

- מדריך שימוש מלא במערכת
- הסבר על כל תבנית פרומפט
- איך להשיג API keys (Perplexity + Gemini)
- דוגמאות שימוש לכל תבנית
- הסבר על אינפוגרפיקות

### 0.3 דוקומנטציה טכנית

**קבצים:**

- `documentation/backend/AI_ANALYSIS_API.md` - API documentation מלא
- `documentation/02-ARCHITECTURE/BACKEND/AI_ANALYSIS_ARCHITECTURE.md` - Backend architecture
- `documentation/02-ARCHITECTURE/FRONTEND/AI_ANALYSIS_ARCHITECTURE.md` - Frontend architecture

### 0.4 תוכנית בדיקות

**קובץ:** `documentation/04-FEATURES/AI_ANALYSIS_SYSTEM_TEST_PLAN.md`

**תוכן:**

- Unit Tests (Backend + Frontend)
- Integration Tests (API + LLM Providers)
- Browser Tests (מלא - כל התכונות)
- E2E Tests (זרימות מלאות)
- Performance Tests
- Security Tests (API keys, encryption)

---

## 📝 תבניות הפרומפטים

### תבנית 1: Equity Research Analysis

**משתנים:**

- Stock Ticker / Company Name
- Investment Thesis
- Goal

**אינטגרציה עם מערכת:**

- שימוש ב-Investment Types: `swing`, `investment`, `passive`, `day_trading`, `scalping`
- שימוש ב-Trading Methods מהמערכת (6 שיטות מסחר)
- שימוש ב-Conditions System להצגת תנאים רלוונטיים

**מבנה:** Fundamental Analysis, Thesis Validation, Sector & Macro View, Catalyst Watch, Investment Summary

### תבנית 2: Technical Analysis Deep Dive

**משתנים:**

- Stock Ticker / Company Name
- Time Frame: [1 day / 1 week / 1 month / 3 months / 1 year]
- Technical Indicators: [בחירה מרשימת Trading Methods במערכת]
- Chart Pattern Focus: [Head & Shoulders, Triangles, Flags, Support/Resistance, Trend Lines]
- Investment Type: [בחירה מ-Investment Types במערכת]

**אינטגרציה עם מערכת:**

- שימוש ב-Trading Methods מהמערכת (6 שיטות מסחר)
- שימוש ב-Method Parameters מהמערכת
- שימוש ב-Conditions System להצגת תנאים טכניים
- שימוש ב-Investment Types מהמערכת

**מבנה:** Price Action Analysis, Technical Indicators Review, Chart Pattern Identification, Support & Resistance Analysis, Trading Setup Assessment, Technical Summary

### תבנית 3: Trade Performance & Portfolio Analysis

**משתנים:**

- Ticker Symbol
- Date Range: [Start date - End date]
- Analysis Focus: [Performance Review / Risk Assessment / Optimization Recommendations]
- Investment Type Filter: [בחירה מ-Investment Types במערכת]
- Trading Account: [אופציונלי - סינון לפי חשבון מסחר]

**אינטגרציה עם מערכת:**

- שימוש בנתוני Trades מהמערכת (`/api/trades/*`)
- שימוש בנתוני Executions מהמערכת (`/api/executions/*`)
- שימוש ב-Investment Types לסינון
- שימוש ב-Trading Accounts לסינון
- שימוש ב-Conditions System להצגת תנאים שפעלו

**מבנה:** Performance Overview, Trade Pattern Analysis, Risk Assessment, Execution Quality Review, Portfolio Optimization Recommendations, Action Plan

### תבנית 4: Risk & Conditions Analysis (מומלץ להוסיף)

**משתנים:**

- Ticker Symbol
- Trade Plan ID: [אופציונלי - ניתוח תנאי תוכנית]
- Trade ID: [אופציונלי - ניתוח תנאי טרייד]
- Condition Focus: [בחירה מ-Trading Methods במערכת]
- Investment Type: [בחירה מ-Investment Types במערכת]

**אינטגרציה עם מערכת:**

- שימוש ב-Plan Conditions מהמערכת (`/api/trade-plans/{id}/conditions`)
- שימוש ב-Trade Conditions מהמערכת (`/api/trades/{id}/conditions`)
- שימוש ב-Alerts מהמערכת (`/api/alerts/*`)
- שימוש ב-Trading Methods להצגת תנאים
- שימוש ב-Investment Types

**מבנה:** Condition Effectiveness Analysis, Risk Profile Assessment, Optimization Recommendations, Action Plan

---

## 🏗️ ארכיטקטורה מלאה

### Backend Components

#### 1. Database Models

**קובץ:** `Backend/models/ai_analysis.py`

```python
class AIPromptTemplate(BaseModel):
    """תבניות פרומפטים"""
    __tablename__ = "ai_prompt_templates"
    
    name = Column(String(100), nullable=False, unique=True)
    name_he = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    prompt_text = Column(Text, nullable=False)  # התבנית המלאה
    variables_json = Column(Text, nullable=False)  # JSON של משתנים
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)

class AIAnalysisRequest(BaseModel):
    """בקשות ניתוח (history)"""
    __tablename__ = "ai_analysis_requests"
    
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    template_id = Column(Integer, ForeignKey('ai_prompt_templates.id'), nullable=False)
    provider = Column(String(50), nullable=False)  # 'gemini' | 'perplexity'
    variables_json = Column(Text, nullable=False)  # המשתנים שהוזנו
    prompt_text = Column(Text, nullable=False)  # הפרומפט הסופי
    response_text = Column(Text, nullable=True)  # התשובה מהמנוע
    response_json = Column(Text, nullable=True)  # JSON אם יש
    status = Column(String(20), default='pending')  # pending | completed | failed
    error_message = Column(Text, nullable=True)

class UserLLMProvider(BaseModel):
    """הגדרות מנוע LLM למשתמש"""
    __tablename__ = "user_llm_providers"
    
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, unique=True)
    default_provider = Column(String(50), default='gemini')  # 'gemini' | 'perplexity'
    gemini_api_key = Column(String(500), nullable=True)  # מוצפן
    perplexity_api_key = Column(String(500), nullable=True)  # מוצפן
    gemini_api_key_encrypted = Column(Boolean, default=True)
    perplexity_api_key_encrypted = Column(Boolean, default=True)
```

#### 2. Services

**קובץ:** `Backend/services/ai_analysis_service.py`

```python
class AIAnalysisService:
    """שירות מרכזי לניהול ניתוחים"""
    - generate_analysis(template_id, variables, user_id)
    - get_analysis_history(user_id, filters)
    - save_analysis_request(request_data)
    
class PromptTemplateService:
    """ניהול תבניות פרומפטים"""
    - get_all_templates()
    - get_template(template_id)
    - create_template(template_data)
    - update_template(template_id, template_data)
    - delete_template(template_id)
    
class LLMProviderManager:
    """ממשק אחיד למנועי LLM שונים"""
    - send_prompt(provider, prompt, api_key)
    - validate_api_key(provider, api_key)
    - get_provider_adapter(provider)
```

#### 3. LLM Provider Adapters

**קבצים:**

- `Backend/services/llm_providers/base_provider.py` - ממשק בסיס
- `Backend/services/llm_providers/gemini_provider.py` - Gemini adapter
- `Backend/services/llm_providers/perplexity_provider.py` - Perplexity adapter

**Base Provider Interface:**

```python
class BaseLLMProvider:
    def send_prompt(self, prompt: str, api_key: str) -> dict
    def validate_api_key(self, api_key: str) -> bool
    def parse_response(self, response: dict) -> dict
```

#### 4. API Routes

**קובץ:** `Backend/routes/api/ai_analysis.py`

```python
POST /api/ai-analysis/generate
  - Body: { template_id, variables, provider }
  - Response: { request_id, status, response_text, response_json }

GET /api/ai-analysis/templates
  - Response: [{ id, name, name_he, description, variables_json }]

GET /api/ai-analysis/history
  - Query: ?user_id=1&limit=50&offset=0
  - Response: [{ id, template_id, provider, created_at, status, response_text }]

GET /api/ai-analysis/history/{request_id}
  - Response: { full request data }

POST /api/ai-analysis/llm-provider
  - Body: { provider, api_key }
  - Response: { success, validated }

GET /api/ai-analysis/llm-provider
  - Response: { default_provider, providers_configured: ['gemini', 'perplexity'] }
```

### Frontend Components

#### 1. Main Page

**קובץ:** `trading-ui/ai-analysis.html`

**מבנה:**

- בחירת תבנית (cards עם icons)
- טופס משתנים דינמי לפי תבנית
- בחירת מנוע LLM
- כפתור "צור ניתוח"
- אזור תוצאות (markdown + אינפוגרפיקות)
- **כפתורי פעולה על תוצאות:**
  - "שמור כהערה" - שמירה כהערה עם קישור לטיקר/טרייד
  - "ייצא ל-PDF" - ייצוא ל-PDF
  - "ייצא ל-Markdown" - ייצוא ל-Markdown
  - "ייצא ל-HTML" - ייצוא ל-HTML
- היסטוריית ניתוחים

#### 2. Services

**קובץ:** `trading-ui/scripts/services/ai-analysis-data.js`

```javascript
window.AIAnalysisData = {
  generateAnalysis(templateId, variables, provider),
  getTemplates(),
  getHistory(filters),
  getLLMProviderSettings(),
  updateLLMProviderSettings(provider, apiKey),
  validateAPIKey(provider, apiKey),
  saveAsNote(analysisResult, relatedType, relatedId), // שמירה כהערה
  exportToPDF(analysisResult), // ייצוא ל-PDF
  exportToMarkdown(analysisResult), // ייצוא ל-Markdown
  exportToHTML(analysisResult) // ייצוא ל-HTML
}
```

#### 3. UI Components

**קבצים:**

- `trading-ui/scripts/ai-analysis-manager.js` - ניהול UI של ניתוחים
- `trading-ui/scripts/ai-result-renderer.js` - רינדור תוצאות + אינפוגרפיקות
- `trading-ui/scripts/ai-template-selector.js` - בחירת תבנית
- `trading-ui/scripts/ai-export-service.js` - שירות ייצוא (PDF/Markdown/HTML)
- `trading-ui/scripts/ai-notes-integration.js` - אינטגרציה עם מערכת הערות

#### 4. User Profile Integration

**קובץ:** `trading-ui/user-profile.html` (עדכון)

**תוספות:**

- סקשן "הגדרות AI Analysis"
- שדות API keys (Gemini + Perplexity)
- בחירת מנוע ברירת מחדל
- כפתור "עזרה" עם מודל הסבר מפורט
- Validation של API keys

#### 5. Notes Integration

**אינטגרציה עם מערכת הערות:**

- שמירת תוצאות AI Analysis כהערה
- קישור הערה לטיקר/טרייד/תוכנית מסחר
- שימוש ב-NotesData.createNote()
- שימוש ב-ModalManagerV2 לפתיחת מודל הערה
- Rich Text Editor (Quill) לתמיכה ב-markdown

**API:**

- `POST /api/notes/` - יצירת הערה
- `NotesData.createNote()` - Frontend service

#### 6. Export Functionality

**ייצוא תוצאות:**

- ייצוא ל-PDF
- ייצוא ל-Markdown
- ייצוא ל-HTML
- שימוש ב-jsPDF או libraries דומות

---

## 🔗 אינטגרציה עם מערכות קיימות

### 1. מערכת התנאים (Conditions System)

**שימוש:**

- תבנית 2 (Technical Analysis): שימוש ב-Trading Methods להצגת תנאים טכניים
- תבנית 4 (Risk & Conditions): שימוש ב-Plan Conditions ו-Trade Conditions

**API:**

- `/api/trading-methods` - רשימת שיטות מסחר
- `/api/trade-plans/{id}/conditions` - תנאי תוכנית
- `/api/trades/{id}/conditions` - תנאי טרייד

**Frontend:**

- `window.conditionsFormGenerator` - יצירת טפסי תנאים
- `window.AlertConditionRenderer` - רינדור תנאים

### 2. סוגי השקעה (Investment Types)

**שימוש:**

- תבנית 1: סינון לפי Investment Type
- תבנית 2: בחירת Investment Type לניתוח טכני
- תבנית 3: סינון נתונים לפי Investment Type

**ערכים:**

- `swing` - סווינג
- `investment` - השקעה
- `passive` - פאסיבי
- `day_trading` - מסחר יומי
- `scalping` - סקלפינג

**API:**

- `/api/trades?investment_type=swing` - סינון טריידים
- Business Rules: `Backend/services/business_logic/business_rules_registry.py`

### 3. מערכת הכפתורים (Button System)

**שימוש:**

- כל הכפתורים בעמוד דרך `data-onclick`
- שימוש ב-`data-button-type` (ADD, TOGGLE, SORT, וכו')
- שימוש ב-`ButtonSystem` ליצירת כפתורים דינמיים

**דוגמה:**

```html
<button 
  data-button-type="PRIMARY" 
  data-variant="full" 
  data-onclick="window.AIAnalysisManager.generateAnalysis()" 
  data-text="צור ניתוח"
  data-icon="sparkles">
</button>
```

### 4. מערכת הצבעים הדינמיים (Color Scheme System)

**שימוש:**

- כל הצבעים מהעדפות (`PreferencesData.loadAllPreferencesRaw`)
- שימוש ב-`ColorManager` לטעינת צבעים
- שימוש ב-`updateCSSVariablesFromPreferences` לעדכון CSS Variables
- אין hardcoded colors - הכל מהעדפות

**Frontend:**

- `window.ColorManager.loadAllColors()`
- `window.updateCSSVariablesFromPreferences(preferences)`

### 5. מערכת הרינדור (Field Renderer Service)

**שימוש:**

- רינדור Status, Amount, Date, Badges
- שימוש ב-`FieldRendererService.renderStatus()`
- שימוש ב-`FieldRendererService.renderAmount()`

**Frontend:**

- `window.FieldRendererService.renderStatus(status, entityType)`
- `window.FieldRendererService.renderAmount(amount, currency)`

### 6. מערכת המודלים (Modal Manager V2)

**שימוש:**

- מודל עזרה להסבר API keys
- מודל עריכה של תבניות (אם נדרש)
- מודל הצגת תוצאות מפורטות

**Frontend:**

- `window.ModalManagerV2.showModal(modalId, mode)`

### 7. מערכת התראות (Notification System)

**שימוש:**

- הודעות הצלחה/שגיאה
- התראות על validation errors
- התראות על API key validation

**Frontend:**

- `window.NotificationSystem.showSuccess(message)`
- `window.NotificationSystem.showError(message)`

### 8. מערכת המטמון (Unified Cache System)

**שימוש:**

- מטמון תבניות פרומפטים
- מטמון היסטוריית ניתוחים
- מטמון הגדרות LLM Provider

**Frontend:**

- `window.UnifiedCacheManager.set(key, value, ttl)`
- `window.UnifiedCacheManager.get(key)`
- `window.CacheTTLGuard.wrap(fn, ttl)`

### 9. מערכת הטבלאות (Unified Table System)

**שימוש:**

- טבלת היסטוריית ניתוחים
- טבלת תבניות (אם נדרש)

**Frontend:**

- `window.UnifiedTableSystem.renderTable(containerId, data, config)`

### 10. מערכת הנתונים (Data Services)

**שימוש:**

- `TradesData` - נתוני טריידים
- `ExecutionsData` - נתוני ביצועים
- `TradingAccountsData` - נתוני חשבונות
- `TickersData` - נתוני טיקרים
- `NotesData` - נתוני הערות

**Frontend:**

- `window.TradesData.loadTrades(filters)`
- `window.ExecutionsData.loadExecutions(filters)`
- `window.NotesData.createNote(options)` - יצירת הערה מתוצאות AI

### 11. מערכת הערות (Notes System)

**שימוש:**

- שמירת תוצאות AI Analysis כהערה
- קישור הערה לטיקר/טרייד/תוכנית מסחר
- Rich Text Editor לתמיכה ב-markdown

**API:**

- `POST /api/notes/` - יצירת הערה
- `related_type_id`: 1=trading_account, 2=trade, 3=trade_plan, 4=ticker
- `related_id`: ID של האובייקט המקושר
- `content`: תוכן הערה (Rich text, עד 10000 תווים)

**Frontend:**

- `window.NotesData.createNote({ payload })` - יצירת הערה
- `window.ModalManagerV2.showModal('notesModal', 'add')` - פתיחת מודל הערה
- `notesModalConfig` - קונפיגורציה למודל הערה

**זרימת שמירה כהערה:**

1. משתמש לוחץ "שמור כהערה" על תוצאות ניתוח
2. מודל בחירה: בחר טיקר/טרייד/תוכנית (אופציונלי)
3. פתיחת מודל הערה עם תוכן מוכן (markdown → HTML)
4. משתמש יכול לערוך לפני שמירה
5. שמירה דרך NotesData.createNote()
6. CRUDResponseHandler מטפל בתגובה
7. CacheSyncManager מבצע invalidation

---

## 🎨 מבנה עמודים לפי ITCSS

### מבנה HTML

```html
<!DOCTYPE html>
<html lang="he" dir="rtl" class="ai-analysis-page">
<head>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Bootstrap CSS - Must load first -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css?v=..." rel="stylesheet">
    
    <!-- Header Styles - חייב להיות לפני master.css -->
    <link rel="stylesheet" href="styles-new/header-styles.css?v=...">
    
    <!-- TikTrack ITCSS Master Styles -->
    <link rel="stylesheet" href="styles-new/master.css?v=...">
    
    <!-- Quill CSS (for rich text if needed) -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.snow.css?v=1.3.7">
</head>
<body class="ai-analysis-page">
    <!-- Header System -->
    <div id="unified-header"></div>
    
    <!-- Page Content -->
    <div class="background-wrapper">
        <div class="page-body">
            <div class="main-content">
                <!-- Sections with proper structure -->
            </div>
        </div>
    </div>
    
    <!-- Scripts in body (static loading) -->
    <!-- All scripts from packages -->
</body>
</html>
```

### כללי ITCSS

1. **אין inline styles** - כל ה-styles ב-CSS files
2. **אין styles בתוך HTML** - רק classes
3. **שימוש במחלקות קיימות** - מקסימום שימוש במחלקות מ-ITCSS
4. **שכבות ITCSS:**
   - 01-settings: Variables
   - 02-tools: Functions & Mixins
   - 03-generic: Reset & Base
   - 04-elements: HTML Elements
   - 05-objects: Layout
   - 06-components: UI Components
   - 07-pages: Page-specific (אם נדרש)
   - 08-themes: Themes
   - 09-utilities: Utilities

### CSS Files ליצירה

**קובץ:** `trading-ui/styles-new/07-pages/_ai-analysis.css`

```css
/* Page-specific styles for AI Analysis page */
/* Only if cannot use existing classes */

.ai-analysis-page .template-card {
    /* Use existing card classes first */
}

.ai-analysis-page .result-container {
    /* Use existing container classes first */
}
```

---

## ⚙️ מערכת איתחול וטעינה

### 1. עדכון Package Manifest

**קובץ:** `trading-ui/scripts/init-system/package-manifest.js`

**הוספת חבילה חדשה:**

```javascript
'ai-analysis': {
  id: 'ai-analysis',
  name: 'AI Analysis Package',
  description: 'AI analysis system with LLM integration',
  version: '1.0.0',
  critical: false,
  loadOrder: 23, // After entity-services, before init-system
  dependencies: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-services'],
  scripts: [
    {
      file: 'services/ai-analysis-data.js',
      globalCheck: 'window.AIAnalysisData',
      description: 'AI Analysis data service',
      required: true,
      loadOrder: 1
    },
    {
      file: 'ai-analysis-manager.js',
      globalCheck: 'window.AIAnalysisManager',
      description: 'AI Analysis UI manager',
      required: true,
      loadOrder: 2
    },
    {
      file: 'ai-result-renderer.js',
      globalCheck: 'window.AIResultRenderer',
      description: 'AI result renderer with markdown and infographics',
      required: true,
      loadOrder: 3
    },
    {
      file: 'ai-template-selector.js',
      globalCheck: 'window.AITemplateSelector',
      description: 'Template selector component',
      required: true,
      loadOrder: 4
    }
  ],
  estimatedSize: '~80KB',
  initTime: '~50ms'
}
```

### 2. עדכון Page Initialization Configs

**קובץ:** `trading-ui/scripts/page-initialization-configs.js`

```javascript
'ai-analysis': {
  name: 'AI Analysis',
  packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-services', 'ai-analysis'],
  requiredGlobals: [
    'NotificationSystem',
    'IconSystem',
    'window.Logger',
    'window.AIAnalysisData',
    'window.AIAnalysisManager',
    'window.AIResultRenderer',
    'window.FieldRendererService',
    'window.ModalManagerV2'
  ],
  description: 'AI analysis page with LLM integration',
  pageType: 'main',
  customInitializers: [
    async (pageConfig) => {
      // Wait for AI Analysis systems
      if (!window.AIAnalysisManager) {
        await new Promise(resolve => {
          const checkInterval = setInterval(() => {
            if (window.AIAnalysisManager) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        });
      }
      
      // Initialize AI Analysis page
      await window.AIAnalysisManager.initialize();
    }
  ],
  sectionsDefaultState: 'open',
  accordionMode: false
}
```

### 3. עדכון User Profile Config

**קובץ:** `trading-ui/scripts/page-initialization-configs.js`

```javascript
'user-profile': {
  // ... existing config ...
  packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-services', 'ai-analysis'],
  // Add AI Analysis globals if needed
}
```

---

## ✏️ מערכת עריכה של תבניות

### מבנה תבנית ב-DB

```json
{
  "name": "Equity Research Analysis",
  "name_he": "ניתוח מחקר הון",
  "description": "ניתוח מפורט של מניה עם פרספקטיבה פונדמנטלית ומקרו-כלכלית",
  "prompt_text": "Act as an elite equity research analyst...",
  "variables_json": {
    "variables": [
      {
        "key": "stock_ticker",
        "label": "Stock Ticker / Company Name",
        "type": "text",
        "required": false,
        "placeholder": "Add name if you want specific analysis"
      },
      {
        "key": "investment_thesis",
        "label": "Investment Thesis",
        "type": "textarea",
        "required": false,
        "placeholder": "Add input here"
      },
      {
        "key": "goal",
        "label": "Goal",
        "type": "text",
        "required": false,
        "placeholder": "Add the goal here"
      }
    ]
  }
}
```

### ממשק עריכה (אם נדרש)

**קובץ:** `trading-ui/scripts/ai-template-editor.js`

**תכונות:**

- עריכת prompt text
- עריכת משתנים (הוספה/מחיקה/עריכה)
- Preview של תבנית
- Validation לפני שמירה

**API:**

- `POST /api/ai-analysis/templates` - יצירת תבנית
- `PUT /api/ai-analysis/templates/{id}` - עדכון תבנית
- `DELETE /api/ai-analysis/templates/{id}` - מחיקת תבנית

---

## 🧪 בדיקות מקיפות

### 1. Unit Tests (Backend)

**קבצים:**

- `Backend/tests/test_ai_analysis_service.py`
- `Backend/tests/test_llm_providers.py`
- `Backend/tests/test_prompt_template_service.py`

**בדיקות:**

- יצירת ניתוח
- שמירת תבנית
- Validation של API keys
- Parsing של responses

### 2. Integration Tests

**קבצים:**

- `Backend/tests/test_ai_analysis_api.py`
- `Backend/tests/test_llm_integration.py`

**בדיקות:**

- API endpoints
- אינטגרציה עם LLM providers
- Error handling

### 3. Browser Tests (מלא)

**קובץ:** `trading-ui/tests/ai-analysis-browser-tests.js`

**בדיקות:**

- טעינת עמוד
- בחירת תבנית
- מילוי טופס
- יצירת ניתוח
- הצגת תוצאות
- היסטוריה
- ניהול API keys

### 4. E2E Tests

**בדיקות:**

- זרימה מלאה: בחירת תבנית → מילוי משתנים → יצירת ניתוח → הצגת תוצאות
- זרימת API keys: הוספת key → validation → שימוש
- זרימת היסטוריה: יצירת ניתוח → שמירה → הצגה בהיסטוריה

### 5. Performance Tests

**בדיקות:**

- זמן תגובה של LLM providers
- זמן טעינת עמוד
- זמן רינדור תוצאות
- זמן טעינת היסטוריה

### 6. Security Tests

**בדיקות:**

- הצפנת API keys
- Validation של API keys
- Authorization (רק משתמש יכול לראות את הניתוחים שלו)
- XSS prevention (בתוצאות markdown)

---

## 📋 שלבי יישום

### שלב 1: דוקומנטציה (FIRST)

1. כתיבת כל הדוקומנטציה (Developer Guide, User Guide, API Docs, Test Plan)
2. עדכון INDEX.md
3. עדכון GENERAL_SYSTEMS_LIST.md

### שלב 2: Backend Foundation

1. יצירת מודלים ב-DB (`ai_analysis.py`)
2. Migration script ליצירת טבלאות
3. יצירת base provider interface
4. יישום Gemini provider
5. יישום Perplexity provider
6. יצירת AIAnalysisService
7. יצירת PromptTemplateService
8. יצירת LLMProviderManager

### שלב 3: API Layer

1. יצירת routes ב-`ai_analysis.py`
2. אינטגרציה עם authentication
3. Validation של inputs
4. Error handling
5. Encryption של API keys

### שלב 4: Frontend - User Profile

1. הוספת סקשן API keys ב-`user-profile.html`
2. יצירת מודל עזרה עם הסברים
3. שמירת הגדרות ב-DB
4. Validation של API keys
5. אינטגרציה עם מערכת הכפתורים

### שלב 5: Frontend - Main Page

1. יצירת `ai-analysis.html` לפי מבנה ITCSS
2. UI לבחירת תבנית (cards)
3. טופס דינמי למשתנים
4. בחירת מנוע LLM
5. אינטגרציה עם services
6. אינטגרציה עם מערכת הכפתורים
7. אינטגרציה עם מערכת הצבעים

### שלב 6: Result Rendering

1. יצירת `ai-result-renderer.js`
2. Parsing של markdown responses
3. תמיכה באינפוגרפיקות (charts/tables)
4. שמירת היסטוריה
5. אינטגרציה עם FieldRendererService
6. **אינטגרציה עם Notes:**
   - יצירת `ai-notes-integration.js`
   - כפתור "שמור כהערה" בתוצאות (דרך ButtonSystem)
   - מודל בחירה: בחר טיקר/טרייד/תוכנית (אופציונלי)
   - המרת markdown → HTML (Rich Text Editor format)
   - פתיחת מודל הערה עם תוכן מוכן
   - משתמש יכול לערוך לפני שמירה
   - שמירה דרך NotesData.createNote()
   - אינטגרציה עם CRUDResponseHandler
7. **ייצוא תוצאות:**
   - יצירת `ai-export-service.js`
   - כפתור "ייצא ל-PDF" (דרך ButtonSystem)
   - כפתור "ייצא ל-Markdown" (דרך ButtonSystem)
   - כפתור "ייצא ל-HTML" (דרך ButtonSystem)
   - שימוש ב-jsPDF ל-PDF
   - המרת markdown ל-HTML נקי

### שלב 7: איתחול וטעינה

1. עדכון package-manifest.js
2. עדכון page-initialization-configs.js
3. בדיקת טעינה מדויקת
4. בדיקת ניטור מערכת

### שלב 8: אינטגרציה עם מערכות

1. אינטגרציה עם Conditions System
2. אינטגרציה עם Investment Types
3. אינטגרציה עם Trading Methods
4. אינטגרציה עם Data Services
5. **אינטגרציה עם Notes System:**
   - יצירת `ai-notes-integration.js`
   - כפתור "שמור כהערה" בתוצאות
   - פתיחת מודל הערה עם תוכן מוכן
   - קישור לטיקר/טרייד/תוכנית
   - שימוש ב-NotesData.createNote()
6. **ייצוא תוצאות:**
   - יצירת `ai-export-service.js`
   - ייצוא ל-PDF (jsPDF)
   - ייצוא ל-Markdown
   - ייצוא ל-HTML
7. אינטגרציה עם כל המערכות האחרות

### שלב 9: בדיקות

1. Unit Tests
2. Integration Tests
3. Browser Tests (מלא)
4. E2E Tests
5. Performance Tests
6. Security Tests

### שלב 10: עדכון דוקומנטציה

1. עדכון Developer Guide לפי יישום בפועל
2. עדכון User Guide לפי יישום בפועל
3. עדכון API Docs לפי יישום בפועל

---

## 📦 קבצים עיקריים ליצירה/עדכון

### Backend

- `Backend/models/ai_analysis.py` (חדש)
- `Backend/services/ai_analysis_service.py` (חדש)
- `Backend/services/llm_providers/base_provider.py` (חדש)
- `Backend/services/llm_providers/gemini_provider.py` (חדש)
- `Backend/services/llm_providers/perplexity_provider.py` (חדש)
- `Backend/routes/api/ai_analysis.py` (חדש)
- `Backend/models/__init__.py` (עדכון)
- `Backend/app.py` (עדכון - רישום routes)

**הערה:** אין צורך ב-API נוסף ל-Notes - משתמשים ב-`/api/notes/` הקיים

### Frontend

- `trading-ui/ai-analysis.html` (חדש)
- `trading-ui/scripts/services/ai-analysis-data.js` (חדש)
- `trading-ui/scripts/ai-analysis-manager.js` (חדש)
- `trading-ui/scripts/ai-result-renderer.js` (חדש)
- `trading-ui/scripts/ai-template-selector.js` (חדש)
- `trading-ui/scripts/ai-export-service.js` (חדש - ייצוא PDF/Markdown/HTML)
- `trading-ui/scripts/ai-notes-integration.js` (חדש - אינטגרציה עם Notes)
- `trading-ui/user-profile.html` (עדכון)
- `trading-ui/scripts/user-profile.js` (עדכון - אם קיים)
- `trading-ui/styles-new/07-pages/_ai-analysis.css` (חדש - אם נדרש)

**הערה:** אין צורך בעדכון `notes-config.js` - משתמשים בקונפיגורציה הקיימת

### Documentation

- `documentation/04-FEATURES/AI_ANALYSIS_SYSTEM_DEVELOPER_GUIDE.md` (חדש)
- `documentation/04-FEATURES/AI_ANALYSIS_SYSTEM_USER_GUIDE.md` (חדש)
- `documentation/backend/AI_ANALYSIS_API.md` (חדש)
- `documentation/02-ARCHITECTURE/BACKEND/AI_ANALYSIS_ARCHITECTURE.md` (חדש)
- `documentation/02-ARCHITECTURE/FRONTEND/AI_ANALYSIS_ARCHITECTURE.md` (חדש)
- `documentation/04-FEATURES/AI_ANALYSIS_SYSTEM_TEST_PLAN.md` (חדש)

### Configuration

- `trading-ui/scripts/init-system/package-manifest.js` (עדכון)
- `trading-ui/scripts/page-initialization-configs.js` (עדכון)

---

## 🔐 אבטחה

### 1. הצפנת API Keys

- שימוש ב-`cryptography` library
- הצפנה לפני שמירה ב-DB
- פענוח רק בעת שימוש
- API keys לעולם לא נשלחים ל-frontend

### 2. Authorization

- רק משתמש יכול לראות את הניתוחים שלו
- Validation של user_id בכל request
- API keys מוצפנים וקשורים למשתמש ספציפי

### 3. Rate Limiting

- הגבלת בקשות למנוע abuse
- Rate limiting per user
- Timeout handling ל-LLM requests

### 4. Input Validation

- Validation של כל ה-inputs
- Sanitization של markdown responses
- XSS prevention בתוצאות

### 5. Notes Integration Security

- Validation של related_type_id ו-related_id
- Authorization - רק משתמש יכול ליצור הערה
- Content sanitization לפני שמירה

---

## 📊 מחקר מנועי LLM

### Perplexity AI

- **Free Tier:** יש API חינמי עם מגבלות
- **Pricing:** Pay-per-use model
- **Documentation:** https://docs.perplexity.ai
- **Features:** Real-time web search, citations

### Google Gemini

- **Free Tier:** יש API חינמי (Gemini 1.5 Flash)
- **Pricing:** Free tier עם quotas יומיים
- **Documentation:** https://ai.google.dev/docs
- **Features:** Multimodal, long context

**המלצה:** להתחיל עם Gemini (חינמי, יציב) + תמיכה ב-Perplexity כאופציה

---

## ✅ Checklist לפני התחלה

- [ ] כל הדוקומנטציה נכתבה
- [ ] תוכנית בדיקות מוכנה
- [ ] מחקר מנועי LLM הושלם
- [ ] ארכיטקטורה מוגדרת
- [ ] אינטגרציה עם כל המערכות מתוכננת
- [ ] מבנה ITCSS מוגדר
- [ ] מערכת איתחול מתוכננת
- [ ] מערכת עריכה מתוכננת

---

**תאריך עדכון אחרון:** 28 בינואר 2025  
**גרסה:** 1.0.0  
**סטטוס:** 📋 ממתין לאישור

