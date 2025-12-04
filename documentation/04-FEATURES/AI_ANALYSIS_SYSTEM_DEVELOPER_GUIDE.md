# AI Analysis System - Developer Guide

**תאריך יצירה:** 28 בינואר 2025  
**גרסה:** 1.0.0  
**סטטוס:** 📋 תיעוד ראשוני

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [ארכיטקטורה](#ארכיטקטורה)
3. [זרימת נתונים](#זרימת-נתונים)
4. [API Reference](#api-reference)
5. [דוגמאות קוד](#דוגמאות-קוד)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)
8. [Integration Points](#integration-points)

---

## 🎯 סקירה כללית

### מטרת המערכת
מערכת AI Analysis מאפשרת למשתמשים ליצור ניתוחים מפורטים של מניות באמצעות מנועי LLM (Gemini/Perplexity). המערכת תומכת ב-4 תבניות פרומפטים שונות ומאפשרת למשתמשים להגדיר API keys אישיים.

### עקרונות יסוד
1. **אינטגרציה מלאה** - שימוש בכל המערכות הקיימות במערכת
2. **אבטחה** - API keys מוצפנים ב-DB
3. **גמישות** - תמיכה במספר מנועי LLM
4. **היסטוריה** - שמירת כל הניתוחים להיסטוריה
5. **תמיכה בשפות** - תמיכה מלאה בעברית ואנגלית עם Option 10 (74%+ עברית)

---

## 🌐 מיפוי כתובות (URL Mapping)

### מבנה הכתובות במערכת

**חשוב:** המערכת משתמשת במיפוי כתובות ללא `.html` וללא `/trading-ui/`:

- ✅ **נכון:** `http://localhost:8080/ai-analysis`
- ❌ **לא נכון:** `http://localhost:8080/trading-ui/ai-analysis.html`
- ❌ **לא נכון:** `http://localhost:8080/ai-analysis.html`

### Route Registration

העמוד רשום ב-`Backend/routes/pages.py`:

```python
@pages_bp.route('/ai-analysis')
def ai_analysis() -> Any:
    """AI Analysis page"""
    return send_from_directory(UI_DIR, "ai-analysis.html")
```

**קישור לתיעוד מלא:** [PAGE_URL_MAPPING.md](../../03-DEVELOPMENT/SETUP/PAGE_URL_MAPPING.md)

---

## 🏗️ ארכיטקטורה

### Backend Architecture

```
Backend/
├── models/
│   └── ai_analysis.py              # Database models
├── services/
│   ├── ai_analysis_service.py     # Main service
│   └── llm_providers/
│       ├── base_provider.py        # Base interface
│       ├── gemini_provider.py      # Gemini adapter
│       └── perplexity_provider.py  # Perplexity adapter
└── routes/
    └── api/
        └── ai_analysis.py          # API endpoints
```

### Frontend Architecture

```
trading-ui/
├── ai-analysis.html                # Main page
└── scripts/
    ├── services/
    │   └── ai-analysis-data.js     # Data service
    ├── ai-analysis-manager.js      # UI manager
    ├── ai-result-renderer.js       # Result renderer
    └── ai-template-selector.js     # Template selector
```

### Database Schema

#### ai_prompt_templates
- `id` - Primary key
- `name` - Template name (English)
- `name_he` - Template name (Hebrew)
- `description` - Template description
- `prompt_text` - Full prompt template
- `variables_json` - JSON of variable definitions
- `is_active` - Active flag
- `sort_order` - Display order

#### ai_analysis_requests
- `id` - Primary key
- `user_id` - Foreign key to users
- `template_id` - Foreign key to templates
- `provider` - LLM provider ('gemini' | 'perplexity')
- `variables_json` - User-provided variables
- `prompt_text` - Final prompt sent to LLM
- `response_text` - LLM response (**נשמר במסד הנתונים**)
- `response_json` - Parsed JSON (if applicable) (**נשמר במסד הנתונים**)
- `status` - Request status ('pending' | 'completed' | 'failed')
- `error_message` - Error message if failed

**הערה חשובה:** `response_text` ו-`response_json` נשמרים במסד הנתונים ולא רק במטמון של הפרונטאנד. זה מאפשר גישה לתוצאות גם בניתוחים חוזרים וגם בעת צפייה מאוחרת.

#### user_llm_providers
- `id` - Primary key
- `user_id` - Foreign key to users (unique)
- `default_provider` - Default LLM provider
- `gemini_api_key` - Encrypted Gemini API key
- `perplexity_api_key` - Encrypted Perplexity API key
- `gemini_api_key_encrypted` - Encryption flag
- `perplexity_api_key_encrypted` - Encryption flag

---

## 🔄 זרימת נתונים

### 1. יצירת ניתוח

```
User → Frontend (ai-analysis.html)
  → AIAnalysisManager.generateAnalysis()
  → AIAnalysisData.generateAnalysis()
  → POST /api/ai-analysis/generate
  → AIAnalysisService.generate_analysis()
  → LLMProviderManager.send_prompt()
  → Gemini/Perplexity Provider
  → Response parsing
  → Save to DB (ai_analysis_requests) - כולל response_text ו-response_json
  → Return to Frontend (עם response_text ב-API response)
  → AIResultRenderer.render()
  → Frontend cache (אופציונלי - למהירות)
```

**הערה חשובה:** `response_text` ו-`response_json` נשמרים במסד הנתונים, כך שהתוצאות זמינות גם בניתוחים חוזרים וגם בעת צפייה מאוחרת.

### 2. טעינת תבניות

```
Frontend
  → AIAnalysisData.getTemplates()
  → GET /api/ai-analysis/templates
  → PromptTemplateService.get_all_templates()
  → Return templates list
  → AITemplateSelector.render()
```

### 3. ניהול API Keys

```
User Profile
  → Update API key
  → POST /api/ai-analysis/llm-provider
  → Encrypt API key
  → Save to DB (user_llm_providers)
  → Validate API key
  → Return validation result
```

---

## 📡 API Reference

### POST /api/ai-analysis/generate

יצירת ניתוח חדש.

**Request Body:**
```json
{
  "template_id": 1,
  "variables": {
    "stock_ticker": "AAPL",
    "investment_thesis": "Strong fundamentals",
    "goal": "Long-term investment"
  },
  "provider": "gemini"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "request_id": 123,
    "status": "completed",
    "response_text": "## Analysis\n\n...",
    "response_json": null,
    "created_at": "2025-01-28T10:00:00Z"
  }
}
```

### GET /api/ai-analysis/templates

קבלת רשימת כל התבניות.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Equity Research Analysis",
      "name_he": "ניתוח מחקר הון",
      "description": "Comprehensive equity analysis",
      "variables_json": {
        "variables": [...]
      }
    }
  ]
}
```

### GET /api/ai-analysis/history

קבלת היסטוריית ניתוחים.

**Query Parameters:**
- `user_id` (required)
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 123,
      "template_id": 1,
      "provider": "gemini",
      "created_at": "2025-01-28T10:00:00Z",
      "status": "completed",
      "response_text": "..."
    }
  ],
  "extra": {
    "count": 10,
    "total": 25
  }
}
```

### POST /api/ai-analysis/llm-provider

עדכון הגדרות LLM Provider.

**Request Body:**
```json
{
  "provider": "gemini",
  "api_key": "your-api-key-here"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "success": true,
    "validated": true
  }
}
```

### GET /api/ai-analysis/llm-provider

קבלת הגדרות LLM Provider נוכחיות.

**Response:**
```json
{
  "status": "success",
  "data": {
    "default_provider": "gemini",
    "providers_configured": ["gemini", "perplexity"]
  }
}
```

---

## 💻 דוגמאות קוד

### Frontend: יצירת ניתוח

```javascript
// Generate analysis
async function generateAnalysis() {
  try {
    const templateId = 1;
    const variables = {
      stock_ticker: 'AAPL',
      investment_thesis: 'Strong fundamentals',
      goal: 'Long-term investment'
    };
    const provider = 'gemini';
    
    const result = await window.AIAnalysisData.generateAnalysis(
      templateId,
      variables,
      provider
    );
    
    if (result.status === 'success') {
      await window.AIResultRenderer.render(result.data);
      window.NotificationSystem.showSuccess('ניתוח נוצר בהצלחה');
    }
  } catch (error) {
    window.NotificationSystem.showError('שגיאה ביצירת ניתוח');
    window.Logger.error('Error generating analysis', error);
  }
}
```

### Frontend: טעינת תבניות

```javascript
// Load templates
async function loadTemplates() {
  try {
    const templates = await window.AIAnalysisData.getTemplates();
    await window.AITemplateSelector.render(templates);
  } catch (error) {
    window.NotificationSystem.showError('שגיאה בטעינת תבניות');
    window.Logger.error('Error loading templates', error);
  }
}
```

### Backend: יצירת ניתוח

```python
from services.ai_analysis_service import AIAnalysisService
from services.llm_providers.llm_provider_manager import LLMProviderManager

def generate_analysis(template_id, variables, user_id):
    # Get template
    template = PromptTemplateService.get_template(template_id)
    
    # Build prompt
    prompt = build_prompt(template.prompt_text, variables)
    
    # Get user's API key
    user_provider = UserLLMProvider.query.filter_by(user_id=user_id).first()
    api_key = decrypt_api_key(user_provider.gemini_api_key)
    
    # Send to LLM
    provider_manager = LLMProviderManager()
    response = provider_manager.send_prompt('gemini', prompt, api_key)
    
    # Save request
    request = AIAnalysisRequest(
        user_id=user_id,
        template_id=template_id,
        provider='gemini',
        variables_json=json.dumps(variables),
        prompt_text=prompt,
        response_text=response['text'],
        status='completed'
    )
    db.session.add(request)
    db.session.commit()
    
    return request
```

---

## ✅ Best Practices

### 1. שימוש במטמון
- תבניות פרומפטים נשמרות במטמון (TTL: 1 hour) - דרך CacheTTLGuard
- היסטוריית ניתוחים נשמרת במטמון (TTL: 5 minutes) - דרך CacheTTLGuard
- הגדרות Providers נשמרות במטמון (TTL: 5 minutes) - דרך CacheTTLGuard
- **חובה:** שימוש ב-CacheTTLGuard.ensure() במקום UnifiedCacheManager ישירות

### 2. איסוף נתונים
- **חובה:** שימוש ב-DataCollectionService.collectFormData() לאיסוף משתנים
- בניית fieldMap דינמית מהתבנית
- תמיכה בברירות מחדל

### 3. Event Handlers
- **חובה:** שימוש ב-data-onclick במקום onclick ישיר
- Event delegation דרך EventHandlerManager
- מניעת כפילויות

### 4. רינדור
- **חובה:** שימוש ב-FieldRendererService לרינדור תאריכים וסטטוסים
- תמיכה בפורמטים עבריים
- תמיכה ב-RTL

### 5. Select Population
- **חובה:** שימוש ב-SelectPopulatorService למילוי select boxes
- תמיכה ב-Tickers, Trading Methods, Accounts, Trade Plans
- תמיכה ב-populateGenericSelect ל-API endpoints כלליים

### 6. Notes Integration
- **חובה:** שימוש ב-ModalManagerV2 לפתיחת מודלים
- שימוש ב-SelectPopulatorService למילוי Related Objects
- שימוש ב-NotesData.createNote() לשמירה
- שימוש ב-CRUDResponseHandler לטיפול בתגובות

### 7. Error Handling
- כל קריאות API עטופות ב-try-catch
- שגיאות מוצגות דרך NotificationSystem
- שגיאות נרשמות ב-Logger עם context מלא

### 8. Security
- API keys מוצפנים תמיד לפני שמירה
- Validation של API keys לפני שימוש
- Authorization - רק משתמש יכול לראות את הניתוחים שלו

### 9. Performance
- שימוש ב-CacheTTLGuard למטמון אוטומטי
- Lazy loading של תבניות
- Debouncing של validation requests
- שימוש ב-CacheSyncManager לניקוי מטמון אוטומטי

### 10. Language Support (Option 10)
- תמיכה מלאה בעברית ואנגלית
- מימוש Option 10 לעברית (74%+ עברית)
- תמיכה בשני המנועים (Gemini ו-Perplexity)
- מונחים פיננסיים ושמות חברות יכולים להיות באנגלית

**מימוש:**
```python
# build_prompt automatically applies Option 10 for Hebrew
variables = {
    'stock_ticker': 'AAPL',
    'response_language': 'hebrew'  # או 'english'
}
prompt = PromptTemplateService.build_prompt(template, variables)
```

**תיעוד נוסף:** ראה `AI_ANALYSIS_HEBREW_RESPONSE_TEST_RESULTS.md`

---

## 🔧 Troubleshooting

> **⚠️ חשוב:** למידע מפורט על בעיות מזוהות ותיקונים נדרשים, ראה: [AI_ANALYSIS_SYSTEM_ISSUES_AND_FIXES.md](AI_ANALYSIS_SYSTEM_ISSUES_AND_FIXES.md)

### בעיה: API key לא עובד
**פתרון:**
1. בדוק שהמפתח הוזן נכון
2. בדוק validation דרך `/api/ai-analysis/llm-provider`
3. בדוק שהמפתח לא פג תוקף
4. בדוק console logs לפרטים נוספים

### בעיה: ניתוח לא נוצר
**פתרון:**
1. בדוק console logs
2. בדוק שהתבנית קיימת
3. בדוק שהמשתנים נכונים (דרך DataCollectionService)
4. בדוק status של request ב-DB
5. בדוק שהמנוע AI נבחר
6. בדוק שהמשתמש הגדיר API key

### בעיה: תוצאות לא מוצגות
**פתרון:**
1. בדוק שהתשובה מהמנוע תקינה
2. בדוק AIResultRenderer logs
3. בדוק markdown parsing
4. בדוק FieldRendererService זמין

### בעיה: שגיאות בקונסולה - מערכות לא זמינות
**פתרון:**
1. בדוק page-initialization-configs.js - requiredGlobals
2. בדוק package-manifest.js - רישום scripts
3. בדוק סדר טעינת scripts ב-HTML
4. בדוק unified-app-initializer.js - customInitializers

### בעיה: Select boxes לא מתמלאים
**פתרון:**
1. בדוק ש-SelectPopulatorService זמין
2. בדוק ש-API endpoints עובדים
3. בדוק console logs לפרטים
4. בדוק fallback logic

### בעיה: Notes לא נשמרות
**פתרון:**
1. בדוק ש-NotesData זמין
2. בדוק ש-ModalManagerV2 זמין
3. בדוק ש-CRUDResponseHandler זמין
4. בדוק console logs לפרטים
5. בדוק שהמשתמש בחר Related Type ו-Related Object

### בעיה: Cache לא עובד
**פתרון:**
1. בדוק ש-CacheTTLGuard זמין
2. בדוק ש-UnifiedCacheManager מאותחל
3. בדוק CACHE_TTL_CONFIG ב-cache-ttl-guard.js
4. בדוק console logs לפרטים

### בעיה: Event handlers לא עובדים
**פתרון:**
1. בדוק ש-EventHandlerManager מאותחל
2. בדוק ש-data-onclick מוגדר נכון
3. בדוק ש-ButtonSystem זמין
4. בדוק console logs לפרטים

---

## 🔗 Integration Points

### 1. CacheTTLGuard
**קובץ:** `trading-ui/scripts/cache-ttl-guard.js`

**שימוש:**
- `ai-analysis-templates` - TTL: 1 hour (stable data)
- `ai-analysis-history` - TTL: 5 minutes (frequently updated)
- `ai-analysis-providers` - TTL: 5 minutes (user settings)

**דוגמה:**
```javascript
// In ai-analysis-data.js
if (window.CacheTTLGuard?.ensure) {
  return await window.CacheTTLGuard.ensure('ai-analysis-templates', async () => {
    // Load from API
  });
}
```

### 2. DataCollectionService
**קובץ:** `trading-ui/scripts/services/data-collection-service.js`

**שימוש:**
- איסוף משתנים דינמיים מטפסים
- המרות טיפוס אוטומטיות
- תמיכה בברירות מחדל

**דוגמה:**
```javascript
// In ai-analysis-manager.js
const fieldMap = {};
template.variables.forEach((variable) => {
  fieldMap[variable.key] = {
    id: `var_${variable.key}`,
    type: variable.type === 'number' ? 'number' : 'text',
    default: variable.default_value || null
  };
});
const variables = window.DataCollectionService.collectFormData(fieldMap);
```

### 3. SelectPopulatorService
**קובץ:** `trading-ui/scripts/services/select-populator-service.js`

**שימוש:**
- מילוי Tickers select
- מילוי Trading Methods select (דרך populateGenericSelect)
- מילוי Related Objects select (במודל Notes)

**דוגמה:**
```javascript
// Populate tickers
await window.SelectPopulatorService.populateTickersSelect(select, {
  includeEmpty: true,
  emptyText: 'בחר טיקר...'
});

// Populate trading methods via generic select
await window.SelectPopulatorService.populateGenericSelect(select, '/api/trading-methods/', {
  valueField: 'id',
  textField: (method) => method.name_he || method.name
});
```

### 4. FieldRendererService
**קובץ:** `trading-ui/scripts/services/field-renderer-service.js`

**שימוש:**
- רינדור תאריכים (renderDate)
- רינדור סטטוסים (renderStatus)
- תמיכה בפורמטים עבריים

**דוגמה:**
```javascript
// Render date with time
const dateHTML = window.FieldRendererService.renderDate(item.created_at, true);

// Render status
const statusHTML = window.FieldRendererService.renderStatus(item.status, 'ai_analysis');
```

### 5. NotesData & CRUDResponseHandler
**קבצים:** 
- `trading-ui/scripts/services/notes-data.js`
- `trading-ui/scripts/services/crud-response-handler.js`

**שימוש:**
- שמירת ניתוח כהערה
- טיפול בתגובות CRUD
- אינטגרציה עם ModalManagerV2

**דוגמה:**
```javascript
// Save as note
const response = await window.NotesData.createNote({ payload });

// Handle response
await window.CRUDResponseHandler.handleSaveResponse(response, {
  modalId: null,
  successMessage: 'הערה נשמרה בהצלחה!',
  entityName: 'הערה',
  requiresHardReload: false
});
```

### 6. ModalManagerV2
**קובץ:** `trading-ui/scripts/modal-manager-v2.js`

**שימוש:**
- פתיחת מודלים לבחירת Related Type/Object
- פתיחת Notes Modal עם prefill
- ניהול מודלים דינמיים

**דוגמה:**
```javascript
// Open notes modal with pre-filled data
await window.ModalManagerV2.showModal('notesModal', 'add', {
  prefill: {
    noteContent: htmlContent,
    noteRelatedType: relatedType,
    noteRelatedObject: relatedId
  }
});
```

### 7. EventHandlerManager
**קובץ:** `trading-ui/scripts/event-handler-manager.js`

**שימוש:**
- כל הכפתורים דרך `data-onclick`
- Event delegation גלובלי
- מניעת כפילויות

**דוגמה:**
```javascript
// Instead of: card.onclick = () => ...
card.setAttribute('data-onclick', `window.AITemplateSelector.selectTemplate(${template.id})`);
```

### 8. Conditions System
- שימוש ב-Trading Methods להצגת תנאים
- שימוש ב-Plan Conditions ו-Trade Conditions
- שימוש ב-ConditionsCRUDManager.getTradingMethods()

### 9. Investment Types
- סינון לפי Investment Types
- שימוש ב-VALID_INVESTMENT_TYPES מ-ui-advanced.js
- שימוש ב-INVESTMENT_TYPE_LABELS לתרגום

### 10. Button System
- כל הכפתורים דרך `data-onclick`
- שימוש ב-ButtonSystem ליצירת כפתורים
- תמיכה ב-data-button-type ו-data-variant

### 11. Color Scheme
- שימוש ב-ColorManager לצבעים
- שימוש ב-updateCSSVariablesFromPreferences
- תמיכה בצבעים דינמיים

---

**תאריך עדכון אחרון:** 28 בינואר 2025  
**גרסה:** 1.0.0

