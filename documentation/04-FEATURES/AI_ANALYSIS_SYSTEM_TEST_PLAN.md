# AI Analysis System - Test Plan

**תאריך יצירה:** 28 בינואר 2025  
**גרסה:** 1.0.0

---

## 📋 תוכן עניינים

1. [Unit Tests](#unit-tests)
2. [Integration Tests](#integration-tests)
3. [Browser Tests](#browser-tests)
4. [E2E Tests](#e2e-tests)
5. [Performance Tests](#performance-tests)
6. [Security Tests](#security-tests)

---

## 🧪 Unit Tests

### Backend Tests

#### test_ai_analysis_service.py

```python
def test_generate_analysis_success()
def test_generate_analysis_invalid_template()
def test_get_analysis_history()
def test_save_analysis_request()
```

#### test_llm_providers.py

```python
def test_gemini_provider_send_prompt()
def test_gemini_provider_validate_api_key()
def test_perplexity_provider_send_prompt()
def test_perplexity_provider_validate_api_key()
```

#### test_prompt_template_service.py

```python
def test_get_all_templates()
def test_get_template()
def test_create_template()
def test_update_template()
def test_delete_template()
```

### Frontend Tests

#### ai-analysis-data.test.js

```javascript
describe('AIAnalysisData', () => {
  test('generateAnalysis() - success')
  test('generateAnalysis() - error')
  test('getTemplates() - success')
  test('getHistory() - success')
  test('saveAsNote() - success')
  test('exportToPDF() - success')
})
```

---

## 🔗 Integration Tests

### test_ai_analysis_api.py

```python
def test_generate_analysis_endpoint()
def test_get_templates_endpoint()
def test_get_history_endpoint()
def test_llm_provider_endpoint()
def test_authentication_required()
```

### test_llm_integration.py

```python
def test_gemini_integration()
def test_perplexity_integration()
def test_error_handling()
def test_rate_limiting()
```

---

## 🌐 Browser Tests

### ai-analysis-browser-tests.js

**קובץ:** `trading-ui/tests/ai-analysis-browser-tests.js`

**בדיקות:**
1. **טעינת עמוד**
   - בדיקת טעינת כל ה-components
   - בדיקת זמינות מערכות
   - בדיקת איתחול

2. **בחירת תבנית**
   - בדיקת הצגת תבניות
   - בדיקת בחירת תבנית
   - בדיקת טעינת משתנים

3. **מילוי טופס**
   - בדיקת שדות דינמיים
   - בדיקת validation
   - בדיקת בחירת מנוע LLM

4. **יצירת ניתוח**
   - בדיקת שליחת בקשה
   - בדיקת הצגת טעינה
   - בדיקת הצגת תוצאות

5. **הצגת תוצאות**
   - בדיקת רינדור markdown
   - בדיקת אינפוגרפיקות
   - בדיקת כפתורי פעולה

6. **היסטוריה**
   - בדיקת טעינת היסטוריה
   - בדיקת פתיחת ניתוח ישן
   - בדיקת מחיקת ניתוח

7. **ניהול API keys**
   - בדיקת הזנת API key
   - בדיקת validation
   - בדיקת שמירה

8. **שמירה כהערה**
   - בדיקת כפתור "שמור כהערה"
   - בדיקת מודל בחירה
   - בדיקת פתיחת מודל הערה
   - בדיקת שמירה

9. **ייצוא**
   - בדיקת ייצוא ל-PDF
   - בדיקת ייצוא ל-Markdown
   - בדיקת ייצוא ל-HTML

---

## 🎭 E2E Tests

### זרימה 1: יצירת ניתוח מלא

```
1. פתיחת עמוד AI Analysis
2. בחירת תבנית "Equity Research Analysis"
3. מילוי משתנים:
   - Stock Ticker: "AAPL"
   - Investment Thesis: "Strong fundamentals"
   - Goal: "Long-term investment"
4. בחירת מנוע: Gemini
5. לחיצה על "צור ניתוח"
6. המתנה לתוצאות
7. בדיקת הצגת תוצאות
8. בדיקת שמירה בהיסטוריה
```

### זרימה 2: שמירה כהערה

```
1. יצירת ניתוח (כמו זרימה 1)
2. לחיצה על "שמור כהערה"
3. בחירת טיקר: "AAPL"
4. פתיחת מודל הערה
5. בדיקת תוכן מוכן
6. עריכה (אופציונלי)
7. שמירה
8. בדיקת יצירת הערה
9. בדיקת קישור לטיקר
```

### זרימה 3: ייצוא

```
1. יצירת ניתוח (כמו זרימה 1)
2. לחיצה על "ייצא ל-PDF"
3. בדיקת הורדת קובץ
4. בדיקת תוכן PDF
```

### זרימה 4: ניהול API keys

```
1. פתיחת פרופיל משתמש
2. גלילה לסקשן "הגדרות AI Analysis"
3. הזנת Gemini API key
4. לחיצה על "שמור"
5. בדיקת validation
6. בדיקת שמירה
```

---

## ⚡ Performance Tests

### Backend Performance

```python
def test_generate_analysis_performance():
    """בדיקת זמן תגובה של יצירת ניתוח"""
    start = time.time()
    result = service.generate_analysis(...)
    duration = time.time() - start
    assert duration < 30  # 30 seconds max
```

### Frontend Performance

```javascript
test('Page load performance', async () => {
  const start = performance.now();
  await AIAnalysisManager.initialize();
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(2000); // 2 seconds max
});
```

### LLM Provider Performance

```python
def test_llm_provider_response_time():
    """בדיקת זמן תגובה של מנוע LLM"""
    start = time.time()
    response = provider.send_prompt(...)
    duration = time.time() - start
    assert duration < 15  # 15 seconds max
```

---

## 🔐 Security Tests

### 1. API Key Encryption

```python
def test_api_key_encryption():
    """בדיקת הצפנת API keys"""
    api_key = "test-key"
    encrypted = encrypt_api_key(api_key)
    assert encrypted != api_key
    assert decrypt_api_key(encrypted) == api_key
```

### 2. Authorization

```python
def test_authorization():
    """בדיקת authorization"""
    # User 1 creates analysis
    result = create_analysis(user_id=1, ...)
    
    # User 2 tries to access
    with pytest.raises(UnauthorizedError):
        get_analysis(result.id, user_id=2)
```

### 3. Input Validation

```python
def test_input_validation():
    """בדיקת validation של inputs"""
    # Invalid template_id
    with pytest.raises(ValidationError):
        generate_analysis(template_id=999, ...)
    
    # Invalid variables
    with pytest.raises(ValidationError):
        generate_analysis(variables={}, ...)
```

### 4. XSS Prevention

```javascript
test('XSS prevention in results', () => {
  const maliciousInput = '<script>alert("XSS")</script>';
  const sanitized = sanitizeMarkdown(maliciousInput);
  expect(sanitized).not.toContain('<script>');
});
```

---

## 📊 Test Coverage Goals

- **Backend:** 80%+ coverage
- **Frontend:** 70%+ coverage
- **Integration:** 100% של כל ה-endpoints
- **E2E:** כל הזרימות העיקריות
- **Security:** כל ה-security checks

---

**תאריך עדכון אחרון:** 28 בינואר 2025  
**גרסה:** 1.0.0




