# AI Analysis System - Dependencies Documentation

**תאריך יצירה:** 28 בינואר 2025  
**גרסה:** 1.0.0

---

## 📋 סקירה כללית

מערכת AI Analysis דורשת חבילות Python נוספות מעבר לחבילות הבסיס של TikTrack. מסמך זה מפרט את כל החבילות הנדרשות, למה הן משמשות, ואיך להתקין אותן.

---

## 🔧 חבילות נדרשות

### 1. httpx (v0.28.1)

**תפקיד:** HTTP client מודרני עבור Perplexity AI API

**למה נדרש:**
- Perplexity AI דורש HTTP client מתקדם עם תמיכה ב-async
- httpx מספק API נקי ונוח יותר מ-requests
- תמיכה מלאה ב-HTTP/2 ו-async/await

**התקנה:**
```bash
pip install httpx==0.28.1
```

**תלויות אוטומטיות:**
- `anyio` - Async I/O library
- `httpcore` - Low-level HTTP client
- `certifi` - SSL certificates
- `idna` - Internationalized Domain Names

**שימוש במערכת:**
- `Backend/services/llm_providers/perplexity_provider.py`

---

### 2. google-generativeai (v0.8.5)

**תפקיד:** Google Gemini API client

**למה נדרש:**
- אינטגרציה עם Google Gemini API
- תמיכה ב-Gemini 1.5 Flash (חינמי)
- תמיכה ב-multimodal content

**התקנה:**
```bash
pip install google-generativeai==0.8.5
```

**תלויות אוטומטיות:**
- `google-ai-generativelanguage==0.6.15` - Gemini API client core
- `google-api-core==2.28.1` - Google API core library
- `google-api-python-client==2.187.0` - Google API Python client
- `google-auth==2.43.0` - Google authentication
- `pydantic==2.12.5` - Data validation
- `grpcio==1.76.0` - gRPC support
- `protobuf==5.29.5` - Protocol buffers
- `tqdm` - Progress bars
- ועוד תלויות נוספות

**שימוש במערכת:**
- `Backend/services/llm_providers/gemini_provider.py`

---

## 📦 התקנה מלאה

### התקנה ידנית

```bash
cd Backend
pip install httpx==0.28.1
pip install google-generativeai==0.8.5
```

### התקנה מ-requirements.txt

```bash
cd Backend
pip install -r requirements.txt
```

החבילות כבר כלולות ב-`Backend/requirements.txt` תחת סקשן "AI Analysis System Dependencies".

---

## ✅ אימות התקנה

### בדיקה מהירה

```bash
python3 -c "import httpx; import google.generativeai; print('✅ All AI Analysis packages installed')"
```

### בדיקה מפורטת

```bash
python3 -c "
import httpx
import google.generativeai as genai
from services.llm_providers.perplexity_provider import PerplexityProvider
from services.llm_providers.gemini_provider import GeminiProvider
print('✅ All AI Analysis packages and providers imported successfully')
"
```

---

## 🔍 פתרון בעיות

### בעיה: ModuleNotFoundError: No module named 'httpx'

**פתרון:**
```bash
pip install httpx==0.28.1
```

**אם עדיין לא עובד:**
- ודא שאתה משתמש ב-Python הנכון: `python3 --version`
- ודא שהחבילה מותקנת ב-Python הנכון: `python3 -m pip install httpx`
- בדוק את PYTHONPATH

### בעיה: ModuleNotFoundError: No module named 'google.generativeai'

**פתרון:**
```bash
pip install google-generativeai==0.8.5
```

**אם עדיין לא עובד:**
- התקן מחדש: `pip uninstall google-generativeai && pip install google-generativeai==0.8.5`
- ודא שאין קונפליקטים עם protobuf: `pip install --upgrade protobuf`

### בעיה: Import errors עם google-generativeai

**פתרון:**
```bash
# התקן מחדש את כל התלויות
pip install --upgrade google-generativeai
pip install --upgrade grpcio
pip install --upgrade protobuf
```

---

## 📊 גודל התקנה

### גודל משוער

- `httpx`: ~73 KB
- `google-generativeai`: ~155 KB
- **סה"כ חבילות ישירות**: ~228 KB
- **סה"כ עם תלויות**: ~25-30 MB

### זמן התקנה

- התקנה מהירה: ~30-60 שניות
- התקנה עם תלויות: ~2-5 דקות (תלוי במהירות האינטרנט)

---

## 🔄 עדכונים עתידיים

### מתי לעדכן

- כאשר Google משחרר גרסה חדשה של Gemini API
- כאשר Perplexity משנה את ה-API שלהם
- כאשר יש תיקוני אבטחה קריטיים

### איך לעדכן

```bash
# בדוק גרסאות חדשות
pip list --outdated | grep -E "httpx|google-generativeai"

# עדכן
pip install --upgrade httpx google-generativeai

# בדוק שהכל עובד
python3 -c "import httpx; import google.generativeai; print('✅ Updated packages work')"
```

---

## 🌍 דרישות לכל סביבה

### Development

✅ **חובה** - כל סביבת פיתוח חייבת לכלול:
- `httpx==0.28.1`
- `google-generativeai==0.8.5`

### Production

✅ **חובה** - כל סביבת production חייבת לכלול:
- `httpx==0.28.1`
- `google-generativeai==0.8.5`

### CI/CD

✅ **חובה** - כל סביבת CI/CD חייבת לכלול:
- `httpx==0.28.1`
- `google-generativeai==0.8.5`

---

## 📝 רשימת בדיקה להתקנה

- [ ] `httpx` מותקן
- [ ] `google-generativeai` מותקן
- [ ] כל ה-providers מייבאים בהצלחה
- [ ] השרת עולה ללא שגיאות
- [ ] API endpoints עובדים
- [ ] בדיקות עוברות

---

## 🔗 קישורים רלוונטיים

- [httpx Documentation](https://www.python-httpx.org/)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Perplexity API Documentation](https://docs.perplexity.ai/)

---

**עודכן:** 28 בינואר 2025








