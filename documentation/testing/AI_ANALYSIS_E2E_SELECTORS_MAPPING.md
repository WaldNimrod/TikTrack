# מיפוי Element Selectors - AI Analysis E2E Tests

**תאריך:** 04.12.2025  
**מטרה:** מיפוי מלא של selectors ב-tests מול HTML אמיתי

---

## סיכום

ה-tests משתמשים ב-selectors רבים שלא קיימים ב-HTML, או selectors שצריכים להיות במודלים ולא בדף הראשי.

---

## טבלת Mapping

| Selector ב-Test | קיים ב-HTML? | מיקום | Selector נכון | הערות |
|----------------|--------------|-------|---------------|-------|
| `#ai-analysis-header` | ✅ כן | בדף הראשי | `#ai-analysis-header` | קיים וניתן להשתמש בו |
| `#ai-analysis-templates` | ❌ לא | - | `#templatesContainer` | צריך להסיר מה-test או לשנות |
| `#ai-analysis-form` | ❌ לא | - | `#aiAnalysisFormModal` | קיים רק במודל `#aiVariablesModal` |
| `#ai-analysis-results` | ❌ לא | - | `#resultsContainerModal` | קיים רק במודל `#aiResultsModal` |
| `#ai-analysis-history` | ✅ כן | בדף הראשי | `#ai-analysis-history` | קיים וניתן להשתמש בו |
| `#templatesContainer` | ✅ כן | בדף הראשי | `#templatesContainer` | קיים וניתן להשתמש בו |
| `#templatesContainerModal` | ✅ כן | במודל | `#templatesContainerModal` | קיים במודל `#aiTemplateSelectionModal` |
| `#variablesContainer` | ❌ לא | - | `#variablesContainerModal` | קיים רק במודל |
| `#variablesContainerModal` | ✅ כן | במודל | `#variablesContainerModal` | קיים במודל `#aiVariablesModal` |
| `#llmProvider` | ❌ לא | - | `#llmProviderModal` | קיים רק במודל |
| `#llmProviderModal` | ✅ כן | במודל | `#llmProviderModal` | קיים במודל `#aiVariablesModal` |
| `#generateAnalysisBtn` | ❌ לא | - | `#generateAnalysisBtnModal` | קיים רק במודל |
| `#generateAnalysisBtnModal` | ✅ כן | במודל | `#generateAnalysisBtnModal` | קיים במודל `#aiVariablesModal` |
| `#exportPDFBtn` | ❌ לא | - | `#exportPDFBtnModal` | קיים רק במודל |
| `#exportPDFBtnModal` | ✅ כן | במודל | `#exportPDFBtnModal` | קיים במודל `#aiResultsModal` |
| `#exportMarkdownBtn` | ❌ לא | - | `#exportMarkdownBtnModal` | קיים רק במודל |
| `#exportMarkdownBtnModal` | ✅ כן | במודל | `#exportMarkdownBtnModal` | קיים במודל `#aiResultsModal` |
| `#exportHTMLBtn` | ❌ לא | - | `#exportHTMLBtnModal` | קיים רק במודל |
| `#exportHTMLBtnModal` | ✅ כן | במודל | `#exportHTMLBtnModal` | קיים במודל `#aiResultsModal` |
| `#saveAsNoteBtn` | ❌ לא | - | `#saveAsNoteBtnModal` | קיים רק במודל |
| `#saveAsNoteBtnModal` | ✅ כן | במודל | `#saveAsNoteBtnModal` | קיים במודל `#aiResultsModal` |
| `#historyContainer` | ✅ כן | בדף הראשי | `#historyContainer` | קיים וניתן להשתמש בו |

---

## Elements בדף הראשי (לא במודלים)

### Header Section
- `#ai-analysis-header` ✅ - קיים

### Templates Section
- `#templatesContainer` ✅ - קיים (בתוך `#ai-analysis-header`)

### History Section
- `#ai-analysis-history` ✅ - קיים
- `#historyContainer` ✅ - קיים (בתוך `#ai-analysis-history`)

### Other
- `#summaryStats` ✅ - קיים (בתוך `#ai-analysis-header`)
- `#aiAnalysisProgressOverlay` ✅ - קיים
- `#unified-header` ✅ - קיים

---

## Elements במודלים

### Modal 1: Template Selection (`#aiTemplateSelectionModal`)
- `#templatesContainerModal` ✅ - קיים

### Modal 2: Variables Form (`#aiVariablesModal`)
- `#aiAnalysisFormModal` ✅ - קיים (form element)
- `#variablesContainerModal` ✅ - קיים
- `#llmProviderModal` ✅ - קיים
- `#responseLanguageModal` ✅ - קיים
- `#generateAnalysisBtnModal` ✅ - קיים
- `#generateAnalysisBtnTextModal` ✅ - קיים
- `#generateAnalysisBtnSpinnerModal` ✅ - קיים
- `#aiVariablesBackBtn` ✅ - קיים
- `#aiVariablesModalBreadcrumb` ✅ - קיים

### Modal 3: Results (`#aiResultsModal`)
- `#resultsContainerModal` ✅ - קיים
- `#saveAsNoteBtnModal` ✅ - קיים
- `#exportPDFBtnModal` ✅ - קיים
- `#exportMarkdownBtnModal` ✅ - קיים
- `#exportHTMLBtnModal` ✅ - קיים
- `#aiResultsBackBtn` ✅ - קיים
- `#aiResultsModalBreadcrumb` ✅ - קיים

---

## בעיות מזוהות

### 1. Selectors שלא קיימים בדף הראשי

**Problematic selectors:**
- `#ai-analysis-templates` - לא קיים (צריך להסיר או לשנות ל-`#templatesContainer`)
- `#ai-analysis-form` - לא קיים (קיים רק במודל)
- `#ai-analysis-results` - לא קיים (קיים רק במודל)
- `#variablesContainer` - לא קיים (קיים רק במודל כ-`#variablesContainerModal`)
- `#llmProvider` - לא קיים (קיים רק במודל כ-`#llmProviderModal`)
- `#generateAnalysisBtn` - לא קיים (קיים רק במודל כ-`#generateAnalysisBtnModal`)
- `#exportPDFBtn` - לא קיים (קיים רק במודל כ-`#exportPDFBtnModal`)
- `#exportMarkdownBtn` - לא קיים (קיים רק במודל כ-`#exportMarkdownBtnModal`)
- `#exportHTMLBtn` - לא קיים (קיים רק במודל כ-`#exportHTMLBtnModal`)
- `#saveAsNoteBtn` - לא קיים (קיים רק במודל כ-`#saveAsNoteBtnModal`)

### 2. Elements שצריכים להיות במודלים

כל ה-form elements וה-result elements נמצאים במודלים ולא בדף הראשי. לכן:
- צריך לפתוח מודל לפני בדיקת elements אלה
- או לבדוק שהם קיימים ב-DOM גם אם hidden

---

## המלצות לתיקון

### 1. עדכון Selectors

**להסיר מה-tests:**
- `#ai-analysis-templates` - לא קיים
- `#ai-analysis-form` - לא קיים (רק במודל)
- `#ai-analysis-results` - לא קיים (רק במודל)

**לעדכן:**
- `#variablesContainer` → `#variablesContainerModal` (במודל)
- `#llmProvider` → `#llmProviderModal` (במודל)
- `#generateAnalysisBtn` → `#generateAnalysisBtnModal` (במודל)
- `#exportPDFBtn` → `#exportPDFBtnModal` (במודל)
- `#exportMarkdownBtn` → `#exportMarkdownBtnModal` (במודל)
- `#exportHTMLBtn` → `#exportHTMLBtnModal` (במודל)
- `#saveAsNoteBtn` → `#saveAsNoteBtnModal` (במודל)

### 2. הוספת Waits למודלים

לפני בדיקת elements במודלים:
1. לחכות שהמודל ייפתח
2. לחכות שה-DOM ייטען במודל
3. לבדוק שה-element קיים ונראה

### 3. בדיקת קיום ב-DOM

אפשר לבדוק שה-element קיים ב-DOM גם אם הוא hidden:
```javascript
const element = page.locator('#exportPDFBtnModal');
await expect(element).toHaveCount(1); // קיים ב-DOM
// או
const count = await element.count();
expect(count).toBe(1);
```

---

## Structure מלא של הדף

### בדף הראשי:
```
<body>
  <div id="unified-header"></div>
  <div id="aiAnalysisProgressOverlay"></div>
  <div class="background-wrapper">
    <div class="page-body">
      <div class="main-content">
        <div id="ai-analysis-header">
          <div id="summaryStats"></div>
          <div id="templatesContainer"></div>
        </div>
        <div id="ai-analysis-history">
          <div id="historyContainer"></div>
        </div>
      </div>
    </div>
  </div>
  <!-- Modals -->
  <!-- Note: Old modals (aiTemplateSelectionModal, aiVariablesModal) removed in December 2025 -->
  <div id="aiAnalysisWizardModal">...</div> <!-- New Wizard interface with 3 steps -->
  <div id="aiResultsModal">...</div> <!-- Still used for rerun and direct result viewing -->
</body>
```

### במודלים:
- **`#aiAnalysisWizardModal`**: ✅ Wizard החדש עם 3 שלבים
  - שלב 1: `#ai-wizard-step-1` - בחירת מנוע (`#wizardProviderSelect`), שפה (`#wizardLanguageSelect`) ותבנית (`#wizardTemplatesContainer`)
  - שלב 2: `#ai-wizard-step-2` - פילטרים (`#wizardFiltersContainer`) ומאפיינים (`#wizardVariablesContainer`)
  - שלב 3: `#ai-wizard-step-3` - תוצאות (`#wizardResultsContainer`)
- **`#aiResultsModal`**: ✅ עדיין בשימוש להרצה חוזרת וצפייה ישירה בתוצאות
  - מכיל `#resultsContainerModal`, `#saveAsNoteBtnModal`, `#exportPDFBtnModal`, וכו'
- **`#aiResultsModal`**: מכיל `#resultsContainerModal`, `#saveAsNoteBtnModal`, `#exportPDFBtnModal`, וכו'

---

## קבצים רלוונטיים

- `trading-ui/ai-analysis.html` - HTML מלא
- `trading-ui/scripts/testing/automated/ai-analysis-e2e.spec.js` - E2E tests

---

**נבדק על ידי:** AI Assistant  
**תאריך:** 04.12.2025

