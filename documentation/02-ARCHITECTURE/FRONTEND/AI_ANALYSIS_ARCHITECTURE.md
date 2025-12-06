# AI Analysis System - Frontend Architecture

**תאריך יצירה:** 28 בינואר 2025  
**גרסה:** 1.0.0

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [Component Structure](#component-structure)
3. [Data Flow](#data-flow)
4. [Integration Points](#integration-points)
5. [State Management](#state-management)

---

## 🎯 סקירה כללית

### ארכיטקטורה כללית

```
Page Load (ai-analysis.html)
    ↓
UnifiedAppInitializer.initialize()
    ↓
AIAnalysisManager.initialize()
    ↓
AITemplateSelector.render()
    ↓
User selects template
    ↓
Dynamic form generation
    ↓
User fills variables
    ↓
AIAnalysisData.generateAnalysis()
    ↓
API Request
    ↓
AIResultRenderer.render()
    ↓
User actions (Save as Note / Export)
```

---

## 🧩 Component Structure

### AIAnalysisManager

**קובץ:** `trading-ui/scripts/ai-analysis-manager.js`

**תפקידים:**
- ניהול UI של עמוד AI Analysis
- קואורדינציה בין components
- טיפול באירועי משתמש

**Methods:**
```javascript
class AIAnalysisManager {
  async initialize()
  async handleTemplateSelection(templateId)
  async handleGenerateAnalysis()
  async handleSaveAsNote(analysisResult)
  async handleExport(analysisResult, format)
}
```

### AITemplateSelector

**קובץ:** `trading-ui/scripts/ai-template-selector.js`

**תפקידים:**
- הצגת תבניות ככרטיסים
- בחירת תבנית
- טעינת משתנים

**Methods:**
```javascript
class AITemplateSelector {
  async render(templates)
  async selectTemplate(templateId)
  getSelectedTemplate()
}
```

### AIResultRenderer

**קובץ:** `trading-ui/scripts/ai-result-renderer.js`

**תפקידים:**
- רינדור תוצאות markdown
- הצגת אינפוגרפיקות
- כפתורי פעולה

**Methods:**
```javascript
class AIResultRenderer {
  async render(analysisResult)
  async renderMarkdown(markdownText)
  async renderInfographics(data)
  async renderActionButtons(analysisResult)
}
```

### AI Notes Integration

**קובץ:** `trading-ui/scripts/ai-notes-integration.js`

**תפקידים:**
- שמירת תוצאות כהערה
- המרת markdown → HTML
- פתיחת מודל הערה

**Methods:**
```javascript
class AINotesIntegration {
  async saveAsNote(analysisResult, relatedType, relatedId)
  async convertMarkdownToHTML(markdownText)
  async openNoteModal(content, relatedType, relatedId)
}
```

### AI Export Service

**קובץ:** `trading-ui/scripts/ai-export-service.js`

**תפקידים:**
- ייצוא ל-PDF
- ייצוא ל-Markdown
- ייצוא ל-HTML

**Methods:**
```javascript
class AIExportService {
  async exportToPDF(analysisResult)
  async exportToMarkdown(analysisResult)
  async exportToHTML(analysisResult)
}
```

---

## 🔄 Data Flow

### 1. טעינת תבניות

```
Page Load
  → AIAnalysisManager.initialize()
  → AIAnalysisData.getTemplates()
  → GET /api/ai-analysis/templates
  → AITemplateSelector.render(templates)
  → Display template cards
```

### 2. יצירת ניתוח

```
User clicks "Generate"
  → AIAnalysisManager.handleGenerateAnalysis()
  → Collect form data
  → AIAnalysisData.generateAnalysis(templateId, variables, provider)
  → POST /api/ai-analysis/generate
  → Wait for response
  → AIResultRenderer.render(result)
  → Display results
```

### 3. שמירה כהערה

```
User clicks "Save as Note"
  → AINotesIntegration.saveAsNote(analysisResult)
  → Show selection modal (ticker/trade/plan)
  → Convert markdown → HTML
  → Open notes modal with pre-filled content
  → User edits (optional)
  → NotesData.createNote()
  → POST /api/notes/
  → CRUDResponseHandler handles response
  → Show success notification
```

### 4. ייצוא

```
User clicks "Export to PDF"
  → AIExportService.exportToPDF(analysisResult)
  → Convert markdown → HTML
  → Use jsPDF to generate PDF
  → Download file
```

---

## 🔗 Integration Points

### 1. Notes System

**שימוש:**
- `NotesData.createNote()` - יצירת הערה
- `ModalManagerV2.showModal('notesModal', 'add')` - פתיחת מודל
- `notesModalConfig` - קונפיגורציה

**דוגמה:**
```javascript
async function saveAsNote(analysisResult) {
  // Show selection modal
  const relatedType = await showRelatedTypeSelector();
  const relatedId = await showRelatedObjectSelector(relatedType);
  
  // Convert markdown to HTML
  const htmlContent = await convertMarkdownToHTML(analysisResult.response_text);
  
  // Open notes modal
  await ModalManagerV2.showModal('notesModal', 'add', {
    prefill: {
      noteContent: htmlContent,
      noteRelatedType: relatedType,
      noteRelatedObject: relatedId
    }
  });
}
```

### 2. Button System

**שימוש:**
- כל הכפתורים דרך `data-onclick`
- `ButtonSystem` ליצירת כפתורים דינמיים

**דוגמה:**
```html
<button 
  data-button-type="PRIMARY" 
  data-variant="full" 
  data-onclick="window.AIAnalysisManager.handleSaveAsNote()" 
  data-text="שמור כהערה"
  data-icon="note">
</button>
```

### 3. Color Scheme

**שימוש:**
- `ColorManager.loadAllColors()` - טעינת צבעים
- `updateCSSVariablesFromPreferences()` - עדכון CSS Variables

### 4. Field Renderer

**שימוש:**
- `FieldRendererService.renderStatus()` - רינדור סטטוס
- `FieldRendererService.renderAmount()` - רינדור סכומים

---

## 📊 State Management

### State Structure

```javascript
window.AIAnalysisState = {
  selectedTemplate: null,
  templates: [],
  currentAnalysis: null,
  history: [],
  llmProviderSettings: {
    defaultProvider: 'gemini',
    providersConfigured: []
  }
}
```

### State Updates

```javascript
// Template selection
AIAnalysisState.selectedTemplate = template;

// Analysis generation
AIAnalysisState.currentAnalysis = result;

// History update
AIAnalysisState.history.unshift(result);
```

---

**תאריך עדכון אחרון:** 28 בינואר 2025  
**גרסה:** 1.0.0















