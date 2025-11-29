# סיכום חבילות Python - TikTrack Server

**תאריך עדכון:** 28 בינואר 2025  
**גרסה:** 1.0.0

---

## 📋 סקירה כללית

מסמך זה מסכם את כל חבילות Python הנדרשות להפעלת שרת TikTrack, כולל חבילות שהוספו לתכונות חדשות.

---

## 🔧 חבילות בסיס (Core Dependencies)

### Flask & Web Framework
- `Flask==2.3.3` - Web framework
- `Flask-CORS==4.0.0` - Cross-Origin Resource Sharing
- `Werkzeug==2.3.7` - WSGI utilities

### Database
- `SQLAlchemy==2.0.23` - ORM
- `psycopg2-binary==2.9.9` - PostgreSQL adapter

### Real-time Communications
- `Flask-SocketIO==5.3.6` - WebSocket support
- `python-socketio==5.8.0` - Socket.IO client
- `python-engineio==4.7.1` - Engine.IO client

### Production Server
- `gunicorn==21.2.0` - Production WSGI server
- `waitress==2.1.2` - Production WSGI server (Windows)
- `requests==2.31.0` - HTTP library

### Security & Encryption
- `cryptography==41.0.7` - Encryption (SMTP passwords, API keys)
- `bcrypt==4.1.2` - Password hashing

### Utilities
- `urllib3<2.0` - HTTP client (SSL compatibility)
- `bleach==6.1.0` - HTML sanitization
- `pytz==2023.3` - Timezone support
- `yfinance==0.2.18` - Yahoo Finance integration

### Testing
- `pytest==7.4.3` - Testing framework
- `pytest-cov==4.1.0` - Coverage plugin
- `pytest-html==4.1.1` - HTML reports
- `pytest-xdist==3.3.1` - Parallel testing
- `psutil==5.9.6` - System utilities
- `schedule==1.2.0` - Task scheduling

---

## 🤖 חבילות AI Analysis (נוספו ינואר 2025)

### httpx (v0.28.1)
**תפקיד:** HTTP client עבור Perplexity AI API

**למה נדרש:**
- אינטגרציה עם Perplexity AI API
- תמיכה ב-async/await
- תמיכה ב-HTTP/2

**התקנה:**
```bash
pip install httpx==0.28.1
```

**תלויות:**
- `anyio` - Async I/O
- `httpcore` - Low-level HTTP
- `certifi` - SSL certificates
- `idna` - Domain names

**שימוש:**
- `Backend/services/llm_providers/perplexity_provider.py`

---

### google-generativeai (v0.8.5)
**תפקיד:** Google Gemini API client

**למה נדרש:**
- אינטגרציה עם Google Gemini API
- תמיכה ב-Gemini 1.5 Flash (חינמי)
- תמיכה ב-multimodal content

**התקנה:**
```bash
pip install google-generativeai==0.8.5
```

**תלויות עיקריות:**
- `google-ai-generativelanguage==0.6.15` - Gemini API core
- `google-api-core==2.28.1` - Google API core
- `google-api-python-client==2.187.0` - Google API client
- `google-auth==2.43.0` - Authentication
- `pydantic==2.12.5` - Data validation
- `grpcio==1.76.0` - gRPC support
- `protobuf==5.29.5` - Protocol buffers
- `tqdm` - Progress bars

**שימוש:**
- `Backend/services/llm_providers/gemini_provider.py`

---

## 📦 התקנה מלאה

### התקנה מ-requirements.txt

```bash
cd Backend
pip install -r requirements.txt
```

### התקנה ידנית של חבילות AI Analysis

```bash
pip install httpx==0.28.1
pip install google-generativeai==0.8.5
```

---

## ✅ אימות התקנה

### בדיקה מהירה

```bash
python3 -c "import httpx; import google.generativeai; print('✅ All packages installed')"
```

### בדיקה מפורטת

```bash
cd Backend
python3 -c "
import httpx
import google.generativeai as genai
from services.llm_providers.perplexity_provider import PerplexityProvider
from services.llm_providers.gemini_provider import GeminiProvider
print('✅ All AI Analysis packages and providers imported successfully')
"
```

---

## 🔍 בדיקת בסיס נתונים

### אימות חיבור

```bash
cd Backend
export POSTGRES_HOST=localhost
export POSTGRES_DB=TikTrack-db-development
export POSTGRES_USER=TikTrakDBAdmin
export POSTGRES_PASSWORD="BigMeZoo1974!?"

python3 -c "
from sqlalchemy import create_engine, text
import os
engine = create_engine(f'postgresql://{os.environ[\"POSTGRES_USER\"]}:{os.environ[\"POSTGRES_PASSWORD\"]}@{os.environ[\"POSTGRES_HOST\"]}:5432/{os.environ[\"POSTGRES_DB\"]}')
conn = engine.connect()
result = conn.execute(text('SELECT COUNT(*) FROM ai_prompt_templates'))
print(f'✅ Database: {os.environ[\"POSTGRES_DB\"]}')
print(f'✅ Templates: {result.scalar()}')
conn.close()
"
```

---

## 🌍 דרישות לכל סביבה

### ✅ Development
- כל החבילות הבסיסיות
- `httpx==0.28.1`
- `google-generativeai==0.8.5`

### ✅ Production
- כל החבילות הבסיסיות
- `httpx==0.28.1`
- `google-generativeai==0.8.5`

### ✅ CI/CD
- כל החבילות הבסיסיות
- `httpx==0.28.1`
- `google-generativeai==0.8.5`

---

## 📝 רשימת בדיקה

- [ ] כל החבילות הבסיסיות מותקנות
- [ ] `httpx` מותקן
- [ ] `google-generativeai` מותקן
- [ ] כל ה-providers מייבאים בהצלחה
- [ ] השרת עולה ללא שגיאות
- [ ] API endpoints עובדים
- [ ] בסיס הנתונים נגיש
- [ ] בדיקות עוברות

---

## 🔗 קישורים רלוונטיים

- [requirements.txt](../../Backend/requirements.txt) - קובץ החבילות המלא
- [AI Analysis Dependencies](./AI_ANALYSIS_DEPENDENCIES.md) - תיעוד מפורט של חבילות AI Analysis
- [Quick Start Guide](./QUICK_START.md) - מדריך התחלה מהירה

---

**עודכן:** 28 בינואר 2025

