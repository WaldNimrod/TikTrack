# AI Analysis System - Backend Architecture

**תאריך יצירה:** 28 בינואר 2025  
**גרסה:** 1.0.0

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [Database Schema](#database-schema)
3. [Service Layer](#service-layer)
4. [LLM Provider Adapters](#llm-provider-adapters)
5. [API Layer](#api-layer)
6. [Security](#security)
7. [Error Handling](#error-handling)

---

## 🎯 סקירה כללית

### ארכיטקטורה כללית

```
Client Request
    ↓
API Routes (ai_analysis.py)
    ↓
AIAnalysisService
    ↓
LLMProviderManager
    ↓
Provider Adapter (Gemini/Perplexity)
    ↓
External LLM API
    ↓
Response Processing
    ↓
Database (ai_analysis_requests)
    ↓
Response to Client
```

---

## 🗄️ Database Schema

### ai_prompt_templates

```sql
CREATE TABLE ai_prompt_templates (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    name_he VARCHAR(100) NOT NULL,
    description TEXT,
    prompt_text TEXT NOT NULL,
    variables_json TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ai_analysis_requests

```sql
CREATE TABLE ai_analysis_requests (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    template_id INTEGER NOT NULL REFERENCES ai_prompt_templates(id),
    provider VARCHAR(50) NOT NULL,
    variables_json TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    response_text TEXT,
    response_json TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### user_llm_providers

```sql
CREATE TABLE user_llm_providers (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    default_provider VARCHAR(50) DEFAULT 'gemini',
    gemini_api_key VARCHAR(500),
    perplexity_api_key VARCHAR(500),
    gemini_api_key_encrypted BOOLEAN DEFAULT TRUE,
    perplexity_api_key_encrypted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔧 Service Layer

### AIAnalysisService

**קובץ:** `Backend/services/ai_analysis_service.py`

**תפקידים:**
- יצירת ניתוחים
- ניהול היסטוריה
- שמירת בקשות

**Methods:**
```python
class AIAnalysisService:
    def generate_analysis(self, template_id, variables, user_id, provider=None):
        """יצירת ניתוח חדש"""
        
    def get_analysis_history(self, user_id, filters=None):
        """קבלת היסטוריית ניתוחים"""
        
    def get_analysis_by_id(self, request_id, user_id):
        """קבלת ניתוח ספציפי"""
        
    def save_analysis_request(self, request_data):
        """שמירת בקשה ב-DB"""
```

### PromptTemplateService

**Option 10 Implementation (November 2025):**
- Full Hebrew translation support with explicit English prohibition
- Achieves 74%+ Hebrew content for professional financial analysis
- Supports both Hebrew and English responses
- Works with all LLM providers (Gemini, Perplexity)

**Key Methods:**
- `build_prompt()` - Builds final prompt with Option 10 for Hebrew
- `_translate_structure_to_hebrew()` - Translates structure section to Hebrew

**See:** `AI_ANALYSIS_HEBREW_RESPONSE_TEST_RESULTS.md` for full details

### PromptTemplateService

**קובץ:** `Backend/services/ai_analysis_service.py`

**תפקידים:**
- ניהול תבניות פרומפטים
- CRUD operations

**Methods:**
```python
class PromptTemplateService:
    def get_all_templates(self, active_only=True):
        """קבלת כל התבניות"""
        
    def get_template(self, template_id):
        """קבלת תבנית ספציפית"""
        
    def create_template(self, template_data):
        """יצירת תבנית חדשה"""
        
    def update_template(self, template_id, template_data):
        """עדכון תבנית"""
        
    def delete_template(self, template_id):
        """מחיקת תבנית"""
```

### LLMProviderManager

**קובץ:** `Backend/services/llm_providers/llm_provider_manager.py`

**תפקידים:**
- ניהול מנועי LLM
- בחירת provider adapter
- Validation של API keys

**Methods:**
```python
class LLMProviderManager:
    def send_prompt(self, provider, prompt, api_key):
        """שליחת פרומפט למנוע"""
        
    def validate_api_key(self, provider, api_key):
        """Validation של API key"""
        
    def get_provider_adapter(self, provider):
        """קבלת adapter למנוע"""
```

---

## 🔌 LLM Provider Adapters

### Base Provider Interface

**קובץ:** `Backend/services/llm_providers/base_provider.py`

```python
from abc import ABC, abstractmethod

class BaseLLMProvider(ABC):
    @abstractmethod
    def send_prompt(self, prompt: str, api_key: str) -> dict:
        """שליחת פרומפט למנוע"""
        pass
    
    @abstractmethod
    def validate_api_key(self, api_key: str) -> bool:
        """Validation של API key"""
        pass
    
    @abstractmethod
    def parse_response(self, response: dict) -> dict:
        """Parsing של תגובה"""
        pass
```

### Gemini Provider

**קובץ:** `Backend/services/llm_providers/gemini_provider.py`

```python
import google.generativeai as genai

class GeminiProvider(BaseLLMProvider):
    def send_prompt(self, prompt: str, api_key: str) -> dict:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        return {
            'text': response.text,
            'json': None
        }
    
    def validate_api_key(self, api_key: str) -> bool:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            model.generate_content('test')
            return True
        except:
            return False
```

### Perplexity Provider

**קובץ:** `Backend/services/llm_providers/perplexity_provider.py`

```python
import httpx

class PerplexityProvider(BaseLLMProvider):
    API_URL = "https://api.perplexity.ai/chat/completions"
    
    def send_prompt(self, prompt: str, api_key: str) -> dict:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "llama-3.1-sonar-large-128k-online",
            "messages": [{"role": "user", "content": prompt}]
        }
        response = httpx.post(self.API_URL, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        return {
            'text': result['choices'][0]['message']['content'],
            'json': None
        }
    
    def validate_api_key(self, api_key: str) -> bool:
        # Similar validation logic
        pass
```

---

## 🌐 API Layer

### Routes Structure

**קובץ:** `Backend/routes/api/ai_analysis.py`

```python
from flask import Blueprint, jsonify, request, g
from services.ai_analysis_service import AIAnalysisService
from services.llm_providers.llm_provider_manager import LLMProviderManager

ai_analysis_bp = Blueprint('ai_analysis', __name__, url_prefix='/api/ai-analysis')

@ai_analysis_bp.route('/generate', methods=['POST'])
@require_auth
def generate_analysis():
    """יצירת ניתוח חדש"""
    pass

@ai_analysis_bp.route('/templates', methods=['GET'])
@require_auth
def get_templates():
    """קבלת תבניות"""
    pass

@ai_analysis_bp.route('/history', methods=['GET'])
@require_auth
def get_history():
    """קבלת היסטוריה"""
    pass

@ai_analysis_bp.route('/llm-provider', methods=['GET', 'POST'])
@require_auth
def manage_llm_provider():
    """ניהול LLM provider"""
    pass
```

---

## 🔐 Security

### API Key Encryption

```python
from cryptography.fernet import Fernet
import base64
import os

class APIKeyEncryption:
    def __init__(self):
        key = os.getenv('ENCRYPTION_KEY')
        self.cipher = Fernet(key)
    
    def encrypt(self, api_key: str) -> str:
        return self.cipher.encrypt(api_key.encode()).decode()
    
    def decrypt(self, encrypted_key: str) -> str:
        return self.cipher.decrypt(encrypted_key.encode()).decode()
```

### Authorization

```python
def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
        g.user_id = user_id
        return f(*args, **kwargs)
    return decorated_function
```

---

## ⚠️ Error Handling

### Error Classes

```python
class AIAnalysisError(Exception):
    pass

class InvalidTemplateError(AIAnalysisError):
    pass

class InvalidAPIKeyError(AIAnalysisError):
    pass

class LLMProviderError(AIAnalysisError):
    pass
```

### Error Handling Pattern

```python
try:
    result = service.generate_analysis(...)
except InvalidTemplateError:
    return jsonify({'status': 'error', 'message': 'Invalid template'}), 400
except InvalidAPIKeyError:
    return jsonify({'status': 'error', 'message': 'Invalid API key'}), 400
except LLMProviderError as e:
    return jsonify({'status': 'error', 'message': str(e)}), 500
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    return jsonify({'status': 'error', 'message': 'Internal server error'}), 500
```

---

**תאריך עדכון אחרון:** 28 בינואר 2025  
**גרסה:** 1.0.0

