#!/usr/bin/env python3
"""
Test different approaches for getting Hebrew responses from LLM
Tests multiple options and measures Hebrew percentage in response
"""

import sys
import os
from pathlib import Path

# Add Backend directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from models.ai_analysis import AIPromptTemplate
from services.llm_providers.llm_provider_manager import LLMProviderManager
from services.api_key_encryption_service import APIKeyEncryptionService
from config.settings import DATABASE_URL
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Test variables
TEST_VARIABLES = {
    'stock_ticker': 'AAPL',
    'investment_thesis': 'דוחות כספיים חזקים',
    'goal': 'השקעה ארוכת טווח',
    'response_language': 'hebrew'
}

def count_hebrew_chars(text: str) -> int:
    """Count Hebrew characters in text"""
    return sum(1 for char in text if '\u0590' <= char <= '\u05FF')

def calculate_hebrew_percentage(text: str) -> float:
    """Calculate percentage of Hebrew characters"""
    if not text:
        return 0.0
    hebrew_count = count_hebrew_chars(text)
    total_chars = len(text)
    return (hebrew_count / total_chars * 100) if total_chars > 0 else 0.0

def build_prompt_option_1(template: AIPromptTemplate, variables: dict) -> str:
    """Option 1: Strong instruction at beginning and end (current approach)"""
    prompt = str(template.prompt_text)
    
    # Replace variables
    for key, value in variables.items():
        if key == 'response_language':
            continue
        placeholder = f"{{{key}}}"
        if placeholder in prompt:
            prompt = prompt.replace(placeholder, str(value))
    
    # Add strong instruction
    prompt = """CRITICAL INSTRUCTION - READ THIS FIRST:
You MUST write your ENTIRE response in Hebrew (עברית). 
כל התשובה שלך חייבת להיות בעברית.
All analysis, recommendations, explanations, conclusions, and any text in your response must be written in Hebrew.
Do not use English words except for proper nouns (company names, ticker symbols).
Write in Hebrew only.

""" + prompt + """

CRITICAL REMINDER - FINAL INSTRUCTION:
You MUST provide your ENTIRE response in Hebrew (עברית).
כל התשובה שלך חייבת להיות בעברית בלבד.
All text must be in Hebrew. Do not use English."""
    
    return prompt

def build_prompt_option_2(template: AIPromptTemplate, variables: dict) -> str:
    """Option 2: Translate part of template to Hebrew + instruction"""
    prompt = str(template.prompt_text)
    
    # Replace variables
    for key, value in variables.items():
        if key == 'response_language':
            continue
        placeholder = f"{{{key}}}"
        if placeholder in prompt:
            prompt = prompt.replace(placeholder, str(value))
    
    # Translate structure instructions to Hebrew
    hebrew_instructions = """
חשוב מאוד - הוראות קריטיות:
אתה חייב לכתוב את כל התשובה שלך בעברית בלבד.
כל הניתוח, ההמלצות, ההסברים והמסקנות חייבים להיות בעברית.
אל תשתמש במילים באנגלית למעט שמות עצם פרטיים (שמות חברות, סמלי טיקרים).
כתוב בעברית בלבד.

בנה את הדוח כך:
- השתמש ב-markdown
- השתמש בנקודות תבליט במקום המתאים
- היה תמציתי, מקצועי, ומונע תובנות
- אל תסביר את התהליך שלך, פשוט תן את הניתוח
"""
    
    # Add Hebrew instructions at beginning
    prompt = hebrew_instructions + "\n\n" + prompt
    
    # Add final reminder
    prompt += "\n\nזכור: כל התשובה שלך חייבת להיות בעברית בלבד!"
    
    return prompt

def build_prompt_option_3(template: AIPromptTemplate, variables: dict) -> str:
    """Option 3: Full Hebrew instruction + example in Hebrew"""
    prompt = str(template.prompt_text)
    
    # Replace variables
    for key, value in variables.items():
        if key == 'response_language':
            continue
        placeholder = f"{{{key}}}"
        if placeholder in prompt:
            prompt = prompt.replace(placeholder, str(value))
    
    # Add comprehensive Hebrew instruction with example
    hebrew_instruction = """חשוב מאוד - הוראות קריטיות:
אתה חייב לכתוב את כל התשובה שלך בעברית בלבד.

דוגמה לפורמט התשובה הנדרש:
---
# דוח מחקר מניות: AAPL

**טיקר / שם חברה:** AAPL / Apple Inc.
**תזת השקעה:** דוחות כספיים חזקים
**מטרה:** השקעה ארוכת טווח

## 1. ניתוח פונדמנטלי
*   **צמיחת הכנסות:** החברה מציגה צמיחה עקבית...
*   **רווחיות:** הרווחיות הגולמית נשמרת ברמות גבוהות...

## 2. אימות תזה
*   **טיעונים תומכים:**
    1. החברה מחזיקה במיקום דומיננטי...
    2. הצמיחה עקבית ומתמשכת...
    3. הרווחיות גבוהה ויציבה...

**המלצה סופית:** קנייה
**רמת ביטחון:** גבוהה
**תקופת זמן צפויה:** 12-18 חודשים
---

כל התשובה שלך חייבת להיות בפורמט הזה - בעברית בלבד!
אל תשתמש באנגלית למעט שמות עצם פרטיים.

"""
    
    prompt = hebrew_instruction + "\n\n" + prompt + "\n\nזכור: כל התשובה שלך חייבת להיות בעברית בלבד!"
    
    return prompt

def build_prompt_option_4(template: AIPromptTemplate, variables: dict) -> str:
    """Option 4: Translate entire structure section to Hebrew"""
    prompt = str(template.prompt_text)
    
    # Replace variables
    for key, value in variables.items():
        if key == 'response_language':
            continue
        placeholder = f"{{{key}}}"
        if placeholder in prompt:
            prompt = prompt.replace(placeholder, str(value))
    
    # Translate the structure section to Hebrew
    hebrew_structure = """
השתמש במבנה הבא כדי לספק דוח מחקר מניות ברור ומנומק:

1. ניתוח פונדמנטלי
2. ניתוח צמיחת הכנסות, מגמות רווחיות גולמית ונקייה, תזרים מזומנים חופשי
3. השוואת מדדי הערכה מול מתחרים בסקטור (P/E, EV/EBITDA, וכו')
4. סקירת בעלות פנימית ועסקאות פנימיות אחרונות
5. אימות תזה
6. הצג 3 טיעונים התומכים בתזה
7. הדגש 2 טיעונים נגדיים או סיכונים מרכזיים
8. ספק החלטה סופית: בוליש / בריש / ניטרלי עם נימוק
9. מבט סקטוריאלי ומקרו
10. תן סקירת סקטור קצרה
11. סקור מגמות מקרו-כלכליות רלוונטיות
12. הסבר את מיקום התחרותי של החברה
13. מעקב קטליזטורים
14. רשום אירועים קרובים (דוחות, השקות מוצרים, רגולציה, וכו')
15. זהה קטליזטורים לטווח קצר וארוך
16. סיכום השקעה
17. סיכום תזה להשקעה ב-5 נקודות
18. המלצה סופית: קנייה / החזקה / מכירה
19. רמת ביטחון (גבוהה / בינונית / נמוכה)
20. תקופת זמן צפויה (למשל 6-12 חודשים)

בנה את הדוח כך:
- השתמש ב-markdown
- השתמש בנקודות תבליט במקום המתאים
- היה תמציתי, מקצועי, ומונע תובנות
- אל תסביר את התהליך שלך, פשוט תן את הניתוח

חשוב מאוד: כל התשובה שלך חייבת להיות בעברית בלבד!
"""
    
    # Replace the structure section with Hebrew version
    # Find the structure section and replace it
    if "Use the following structure" in prompt:
        # Split prompt and replace structure section
        parts = prompt.split("Use the following structure")
        if len(parts) > 1:
            # Keep everything before "Use the following structure"
            before = parts[0]
            # Find where structure section ends (before "Build the report")
            after_parts = parts[1].split("Build the report")
            if len(after_parts) > 1:
                after = "Build the report" + after_parts[1]
                prompt = before + hebrew_structure + "\n\n" + after
            else:
                prompt = before + hebrew_structure
        else:
            prompt = hebrew_structure + "\n\n" + prompt
    else:
        prompt = hebrew_structure + "\n\n" + prompt
    
    return prompt

def build_prompt_option_5(template: AIPromptTemplate, variables: dict) -> str:
    """Option 5: Combine Option 1 + Option 3 (Strong instruction + Example)"""
    prompt = str(template.prompt_text)
    
    # Replace variables
    for key, value in variables.items():
        if key == 'response_language':
            continue
        placeholder = f"{{{key}}}"
        if placeholder in prompt:
            prompt = prompt.replace(placeholder, str(value))
    
    # Combine strong instruction with Hebrew example
    hebrew_instruction = """CRITICAL INSTRUCTION - READ THIS FIRST:
You MUST write your ENTIRE response in Hebrew (עברית). 
כל התשובה שלך חייבת להיות בעברית בלבד.
All analysis, recommendations, explanations, conclusions, and any text in your response must be written in Hebrew.
Do not use English words except for proper nouns (company names, ticker symbols).
Write in Hebrew only.

EXAMPLE OF REQUIRED FORMAT (כל התשובה חייבת להיות בפורמט הזה):
---
# דוח מחקר מניות: AAPL

**טיקר / שם חברה:** AAPL / Apple Inc.
**תזת השקעה:** דוחות כספיים חזקים
**מטרה:** השקעה ארוכת טווח

## 1. ניתוח פונדמנטלי
*   **צמיחת הכנסות:** החברה מציגה צמיחה עקבית וחזקה בהכנסות, מונעת בעיקר על ידי מגזר השירותים המתפתח.
*   **רווחיות:** הרווחיות הגולמית נשמרת ברמות גבוהות (כ-45%), המשקפת את כוח המותג.

## 2. אימות תזה
*   **טיעונים תומכים:**
    1. החברה מחזיקה במיקום דומיננטי בשוק הטכנולוגיה.
    2. הצמיחה עקבית ומתמשכת לאורך שנים.
    3. הרווחיות גבוהה ויציבה.

**המלצה סופית:** קנייה
**רמת ביטחון:** גבוהה
**תקופת זמן צפויה:** 12-18 חודשים
---

כל התשובה שלך חייבת להיות בפורמט הזה - בעברית בלבד!

"""
    
    prompt = hebrew_instruction + "\n\n" + prompt + """

CRITICAL REMINDER - FINAL INSTRUCTION:
You MUST provide your ENTIRE response in Hebrew (עברית).
כל התשובה שלך חייבת להיות בעברית בלבד.
All text must be in Hebrew. Do not use English."""
    
    return prompt

def build_prompt_option_6(template: AIPromptTemplate, variables: dict) -> str:
    """Option 6: Translate entire prompt template to Hebrew"""
    # Start with Hebrew version of the entire prompt
    prompt_hebrew = """תפעל כאנליסט מחקר מניות מוביל בחברת השקעות או קרן גידור מהשורה הראשונה. היית הטוב ביותר בכיתה שלך והניתוח שלך תמיד ברמה הגבוהה ביותר. אתה צריך לנתח חברה תוך שימוש בפרספקטיבות פונדמנטליות ומקרו-כלכליות. בנה את התשובה שלך לפי המסגרת שלהלן.

טיקר / שם חברה: {stock_ticker}
תזת השקעה: {investment_thesis}
מטרה: {goal}

השתמש במבנה הבא כדי לספק דוח מחקר מניות ברור ומנומק:

1. ניתוח פונדמנטלי
2. ניתוח צמיחת הכנסות, מגמות רווחיות גולמית ונקייה, תזרים מזומנים חופשי
3. השוואת מדדי הערכה מול מתחרים בסקטור (P/E, EV/EBITDA, וכו')
4. סקירת בעלות פנימית ועסקאות פנימיות אחרונות
5. אימות תזה
6. הצג 3 טיעונים התומכים בתזה
7. הדגש 2 טיעונים נגדיים או סיכונים מרכזיים
8. ספק החלטה סופית: בוליש / בריש / ניטרלי עם נימוק
9. מבט סקטוריאלי ומקרו
10. תן סקירת סקטור קצרה
11. סקור מגמות מקרו-כלכליות רלוונטיות
12. הסבר את מיקום התחרותי של החברה
13. מעקב קטליזטורים
14. רשום אירועים קרובים (דוחות, השקות מוצרים, רגולציה, וכו')
15. זהה קטליזטורים לטווח קצר וארוך
16. סיכום השקעה
17. סיכום תזה להשקעה ב-5 נקודות
18. המלצה סופית: קנייה / החזקה / מכירה
19. רמת ביטחון (גבוהה / בינונית / נמוכה)
20. תקופת זמן צפויה (למשל 6-12 חודשים)

בנה את הדוח כך:
- השתמש ב-markdown
- השתמש בנקודות תבליט במקום המתאים
- היה תמציתי, מקצועי, ומונע תובנות
- אל תסביר את התהליך שלך, פשוט תן את הניתוח

חשוב מאוד: כל התשובה שלך חייבת להיות בעברית בלבד!"""
    
    # Replace variables
    for key, value in variables.items():
        if key == 'response_language':
            continue
        placeholder = f"{{{key}}}"
        if placeholder in prompt_hebrew:
            prompt_hebrew = prompt_hebrew.replace(placeholder, str(value))
    
    return prompt_hebrew

def build_prompt_option_7(template: AIPromptTemplate, variables: dict) -> str:
    """Option 7: Option 5 + Translate structure section to Hebrew"""
    prompt = str(template.prompt_text)
    
    # Replace variables
    for key, value in variables.items():
        if key == 'response_language':
            continue
        placeholder = f"{{{key}}}"
        if placeholder in prompt:
            prompt = prompt.replace(placeholder, str(value))
    
    # Translate structure section to Hebrew
    hebrew_structure = """
השתמש במבנה הבא כדי לספק דוח מחקר מניות ברור ומנומק:

1. ניתוח פונדמנטלי
2. ניתוח צמיחת הכנסות, מגמות רווחיות גולמית ונקייה, תזרים מזומנים חופשי
3. השוואת מדדי הערכה מול מתחרים בסקטור (P/E, EV/EBITDA, וכו')
4. סקירת בעלות פנימית ועסקאות פנימיות אחרונות
5. אימות תזה
6. הצג 3 טיעונים התומכים בתזה
7. הדגש 2 טיעונים נגדיים או סיכונים מרכזיים
8. ספק החלטה סופית: בוליש / בריש / ניטרלי עם נימוק
9. מבט סקטוריאלי ומקרו
10. תן סקירת סקטור קצרה
11. סקור מגמות מקרו-כלכליות רלוונטיות
12. הסבר את מיקום התחרותי של החברה
13. מעקב קטליזטורים
14. רשום אירועים קרובים (דוחות, השקות מוצרים, רגולציה, וכו')
15. זהה קטליזטורים לטווח קצר וארוך
16. סיכום השקעה
17. סיכום תזה להשקעה ב-5 נקודות
18. המלצה סופית: קנייה / החזקה / מכירה
19. רמת ביטחון (גבוהה / בינונית / נמוכה)
20. תקופת זמן צפויה (למשל 6-12 חודשים)

בנה את הדוח כך:
- השתמש ב-markdown
- השתמש בנקודות תבליט במקום המתאים
- היה תמציתי, מקצועי, ומונע תובנות
- אל תסביר את התהליך שלך, פשוט תן את הניתוח
"""
    
    # Replace structure section
    if "Use the following structure" in prompt:
        parts = prompt.split("Use the following structure")
        if len(parts) > 1:
            before = parts[0]
            after_parts = parts[1].split("Build the report")
            if len(after_parts) > 1:
                after = "Build the report" + after_parts[1]
                prompt = before + hebrew_structure + "\n\n" + after
            else:
                prompt = before + hebrew_structure
        else:
            prompt = hebrew_structure + "\n\n" + prompt
    else:
        prompt = hebrew_structure + "\n\n" + prompt
    
    # Add strong instruction with example
    hebrew_instruction = """CRITICAL INSTRUCTION - READ THIS FIRST:
You MUST write your ENTIRE response in Hebrew (עברית). 
כל התשובה שלך חייבת להיות בעברית בלבד.
All analysis, recommendations, explanations, conclusions, and any text in your response must be written in Hebrew.
Do not use English words except for proper nouns (company names, ticker symbols).
Write in Hebrew only.

EXAMPLE OF REQUIRED FORMAT (כל התשובה חייבת להיות בפורמט הזה):
---
# דוח מחקר מניות: AAPL

**טיקר / שם חברה:** AAPL / Apple Inc.
**תזת השקעה:** דוחות כספיים חזקים
**מטרה:** השקעה ארוכת טווח

## 1. ניתוח פונדמנטלי
*   **צמיחת הכנסות:** החברה מציגה צמיחה עקבית וחזקה בהכנסות.
*   **רווחיות:** הרווחיות הגולמית נשמרת ברמות גבוהות.

**המלצה סופית:** קנייה
**רמת ביטחון:** גבוהה
---

כל התשובה שלך חייבת להיות בפורמט הזה - בעברית בלבד!

"""
    
    prompt = hebrew_instruction + "\n\n" + prompt + """

CRITICAL REMINDER - FINAL INSTRUCTION:
You MUST provide your ENTIRE response in Hebrew (עברית).
כל התשובה שלך חייבת להיות בעברית בלבד.
All text must be in Hebrew. Do not use English."""
    
    return prompt

def build_prompt_option_8(template: AIPromptTemplate, variables: dict) -> str:
    """Option 8: Full Hebrew Translation + Strong instruction + Example"""
    # Start with Hebrew version of the entire prompt
    prompt_hebrew = """תפעל כאנליסט מחקר מניות מוביל בחברת השקעות או קרן גידור מהשורה הראשונה. היית הטוב ביותר בכיתה שלך והניתוח שלך תמיד ברמה הגבוהה ביותר. אתה צריך לנתח חברה תוך שימוש בפרספקטיבות פונדמנטליות ומקרו-כלכליות. בנה את התשובה שלך לפי המסגרת שלהלן.

טיקר / שם חברה: {stock_ticker}
תזת השקעה: {investment_thesis}
מטרה: {goal}

השתמש במבנה הבא כדי לספק דוח מחקר מניות ברור ומנומק:

1. ניתוח פונדמנטלי
2. ניתוח צמיחת הכנסות, מגמות רווחיות גולמית ונקייה, תזרים מזומנים חופשי
3. השוואת מדדי הערכה מול מתחרים בסקטור (P/E, EV/EBITDA, וכו')
4. סקירת בעלות פנימית ועסקאות פנימיות אחרונות
5. אימות תזה
6. הצג 3 טיעונים התומכים בתזה
7. הדגש 2 טיעונים נגדיים או סיכונים מרכזיים
8. ספק החלטה סופית: בוליש / בריש / ניטרלי עם נימוק
9. מבט סקטוריאלי ומקרו
10. תן סקירת סקטור קצרה
11. סקור מגמות מקרו-כלכליות רלוונטיות
12. הסבר את מיקום התחרותי של החברה
13. מעקב קטליזטורים
14. רשום אירועים קרובים (דוחות, השקות מוצרים, רגולציה, וכו')
15. זהה קטליזטורים לטווח קצר וארוך
16. סיכום השקעה
17. סיכום תזה להשקעה ב-5 נקודות
18. המלצה סופית: קנייה / החזקה / מכירה
19. רמת ביטחון (גבוהה / בינונית / נמוכה)
20. תקופת זמן צפויה (למשל 6-12 חודשים)

בנה את הדוח כך:
- השתמש ב-markdown
- השתמש בנקודות תבליט במקום המתאים
- היה תמציתי, מקצועי, ומונע תובנות
- אל תסביר את התהליך שלך, פשוט תן את הניתוח

חשוב מאוד - הוראה קריטית:
כל התשובה שלך חייבת להיות בעברית בלבד!
אל תשתמש במילים באנגלית למעט שמות עצם פרטיים (שמות חברות, סמלי טיקרים).

דוגמה לפורמט הנדרש:
---
# דוח מחקר מניות: AAPL

**טיקר / שם חברה:** AAPL / Apple Inc.
**תזת השקעה:** דוחות כספיים חזקים
**מטרה:** השקעה ארוכת טווח

## 1. ניתוח פונדמנטלי
*   **צמיחת הכנסות:** החברה מציגה צמיחה עקבית וחזקה בהכנסות, מונעת בעיקר על ידי מגזר השירותים המתפתח.
*   **רווחיות:** הרווחיות הגולמית נשמרת ברמות גבוהות (כ-45%), המשקפת את כוח המותג.

## 2. אימות תזה
*   **טיעונים תומכים:**
    1. החברה מחזיקה במיקום דומיננטי בשוק הטכנולוגיה.
    2. הצמיחה עקבית ומתמשכת לאורך שנים.
    3. הרווחיות גבוהה ויציבה.

**המלצה סופית:** קנייה
**רמת ביטחון:** גבוהה
**תקופת זמן צפויה:** 12-18 חודשים
---

כל התשובה שלך חייבת להיות בפורמט הזה - בעברית בלבד!"""
    
    # Replace variables
    for key, value in variables.items():
        if key == 'response_language':
            continue
        placeholder = f"{{{key}}}"
        if placeholder in prompt_hebrew:
            prompt_hebrew = prompt_hebrew.replace(placeholder, str(value))
    
    return prompt_hebrew

def build_prompt_option_9(template: AIPromptTemplate, variables: dict) -> str:
    """Option 9: Full Hebrew Translation + Multiple reminders throughout"""
    prompt_hebrew = """תפעל כאנליסט מחקר מניות מוביל בחברת השקעות או קרן גידור מהשורה הראשונה. היית הטוב ביותר בכיתה שלך והניתוח שלך תמיד ברמה הגבוהה ביותר. אתה צריך לנתח חברה תוך שימוש בפרספקטיבות פונדמנטליות ומקרו-כלכליות.

⚠️ הוראה קריטית: כל התשובה שלך חייבת להיות בעברית בלבד! ⚠️

בנה את התשובה שלך לפי המסגרת שלהלן:

טיקר / שם חברה: {stock_ticker}
תזת השקעה: {investment_thesis}
מטרה: {goal}

⚠️ זכור: כל התשובה חייבת להיות בעברית בלבד! ⚠️

השתמש במבנה הבא כדי לספק דוח מחקר מניות ברור ומנומק:

1. ניתוח פונדמנטלי
⚠️ כתוב בעברית בלבד! ⚠️
2. ניתוח צמיחת הכנסות, מגמות רווחיות גולמית ונקייה, תזרים מזומנים חופשי
3. השוואת מדדי הערכה מול מתחרים בסקטור (P/E, EV/EBITDA, וכו')
4. סקירת בעלות פנימית ועסקאות פנימיות אחרונות
5. אימות תזה
⚠️ כתוב בעברית בלבד! ⚠️
6. הצג 3 טיעונים התומכים בתזה
7. הדגש 2 טיעונים נגדיים או סיכונים מרכזיים
8. ספק החלטה סופית: בוליש / בריש / ניטרלי עם נימוק
9. מבט סקטוריאלי ומקרו
10. תן סקירת סקטור קצרה
11. סקור מגמות מקרו-כלכליות רלוונטיות
12. הסבר את מיקום התחרותי של החברה
13. מעקב קטליזטורים
14. רשום אירועים קרובים (דוחות, השקות מוצרים, רגולציה, וכו')
15. זהה קטליזטורים לטווח קצר וארוך
16. סיכום השקעה
⚠️ כתוב בעברית בלבד! ⚠️
17. סיכום תזה להשקעה ב-5 נקודות
18. המלצה סופית: קנייה / החזקה / מכירה
19. רמת ביטחון (גבוהה / בינונית / נמוכה)
20. תקופת זמן צפויה (למשל 6-12 חודשים)

בנה את הדוח כך:
- השתמש ב-markdown
- השתמש בנקודות תבליט במקום המתאים
- היה תמציתי, מקצועי, ומונע תובנות
- אל תסביר את התהליך שלך, פשוט תן את הניתוח

⚠️⚠️⚠️ הוראה סופית קריטית: כל התשובה שלך חייבת להיות בעברית בלבד! ⚠️⚠️⚠️
אל תשתמש במילים באנגלית למעט שמות עצם פרטיים (שמות חברות, סמלי טיקרים).
כתוב בעברית בלבד!"""
    
    # Replace variables
    for key, value in variables.items():
        if key == 'response_language':
            continue
        placeholder = f"{{{key}}}"
        if placeholder in prompt_hebrew:
            prompt_hebrew = prompt_hebrew.replace(placeholder, str(value))
    
    return prompt_hebrew

def build_prompt_option_10(template: AIPromptTemplate, variables: dict) -> str:
    """Option 10: Option 9 + Explicitly forbid English words"""
    prompt_hebrew = """תפעל כאנליסט מחקר מניות מוביל בחברת השקעות או קרן גידור מהשורה הראשונה. היית הטוב ביותר בכיתה שלך והניתוח שלך תמיד ברמה הגבוהה ביותר. אתה צריך לנתח חברה תוך שימוש בפרספקטיבות פונדמנטליות ומקרו-כלכליות.

🚫 אסור להשתמש במילים באנגלית! 🚫
⚠️ כל התשובה חייבת להיות בעברית בלבד! ⚠️
❌ DO NOT use English words! ❌
✅ Use Hebrew ONLY! ✅

בנה את התשובה שלך לפי המסגרת שלהלן:

טיקר / שם חברה: {stock_ticker}
תזת השקעה: {investment_thesis}
מטרה: {goal}

🚫 אסור להשתמש במילים באנגלית! 🚫
⚠️ כל התשובה חייבת להיות בעברית בלבד! ⚠️

השתמש במבנה הבא כדי לספק דוח מחקר מניות ברור ומנומק:

1. ניתוח פונדמנטלי
🚫 כתוב בעברית בלבד - אסור להשתמש באנגלית! 🚫
2. ניתוח צמיחת הכנסות, מגמות רווחיות גולמית ונקייה, תזרים מזומנים חופשי
3. השוואת מדדי הערכה מול מתחרים בסקטור (P/E, EV/EBITDA, וכו')
4. סקירת בעלות פנימית ועסקאות פנימיות אחרונות
5. אימות תזה
🚫 כתוב בעברית בלבד - אסור להשתמש באנגלית! 🚫
6. הצג 3 טיעונים התומכים בתזה
7. הדגש 2 טיעונים נגדיים או סיכונים מרכזיים
8. ספק החלטה סופית: בוליש / בריש / ניטרלי עם נימוק
9. מבט סקטוריאלי ומקרו
10. תן סקירת סקטור קצרה
11. סקור מגמות מקרו-כלכליות רלוונטיות
12. הסבר את מיקום התחרותי של החברה
13. מעקב קטליזטורים
14. רשום אירועים קרובים (דוחות, השקות מוצרים, רגולציה, וכו')
15. זהה קטליזטורים לטווח קצר וארוך
16. סיכום השקעה
🚫 כתוב בעברית בלבד - אסור להשתמש באנגלית! 🚫
17. סיכום תזה להשקעה ב-5 נקודות
18. המלצה סופית: קנייה / החזקה / מכירה
19. רמת ביטחון (גבוהה / בינונית / נמוכה)
20. תקופת זמן צפויה (למשל 6-12 חודשים)

בנה את הדוח כך:
- השתמש ב-markdown
- השתמש בנקודות תבליט במקום המתאים
- היה תמציתי, מקצועי, ומונע תובנות
- אל תסביר את התהליך שלך, פשוט תן את הניתוח

🚫🚫🚫 אסור להשתמש במילים באנגלית! 🚫🚫🚫
⚠️⚠️⚠️ כל התשובה חייבת להיות בעברית בלבד! ⚠️⚠️⚠️
❌❌❌ DO NOT use English words! ❌❌❌
✅✅✅ Use Hebrew ONLY! ✅✅✅
כתוב בעברית בלבד! אל תשתמש במילים באנגלית למעט שמות עצם פרטיים (שמות חברות, סמלי טיקרים)."""
    
    # Replace variables
    for key, value in variables.items():
        if key == 'response_language':
            continue
        placeholder = f"{{{key}}}"
        if placeholder in prompt_hebrew:
            prompt_hebrew = prompt_hebrew.replace(placeholder, str(value))
    
    return prompt_hebrew

def translate_common_english_terms(text: str) -> str:
    """Post-process: Translate common English financial terms to Hebrew"""
    translations = {
        'Revenue': 'הכנסות',
        'Growth': 'צמיחה',
        'Margin': 'רווחיות',
        'Analysis': 'ניתוח',
        'Recommendation': 'המלצה',
        'Buy': 'קנייה',
        'Sell': 'מכירה',
        'Hold': 'החזקה',
        'High': 'גבוהה',
        'Medium': 'בינונית',
        'Low': 'נמוכה',
        'Bullish': 'בוליש',
        'Bearish': 'בריש',
        'Neutral': 'ניטרלי',
        'Fundamental': 'פונדמנטלי',
        'Technical': 'טכני',
        'Valuation': 'הערכה',
        'Risk': 'סיכון',
        'Return': 'תשואה',
        'Investment': 'השקעה',
        'Portfolio': 'פורטפוליו',
        'Sector': 'סקטור',
        'Market': 'שוק',
        'Company': 'חברה',
        'Stock': 'מניה',
        'Price': 'מחיר',
        'Earnings': 'רווחים',
        'Cash Flow': 'תזרים מזומנים',
        'Free Cash Flow': 'תזרים מזומנים חופשי',
    }
    
    # Simple word replacement (not perfect, but helps)
    for eng, heb in translations.items():
        # Replace whole words only
        import re
        text = re.sub(r'\b' + re.escape(eng) + r'\b', heb, text, flags=re.IGNORECASE)
    
    return text

def test_option_with_postprocessing(option_name: str, build_func, template: AIPromptTemplate, variables: dict, provider_manager: LLMProviderManager, api_key: str):
    """Test option with post-processing translation"""
    result = test_option(option_name, build_func, template, variables, provider_manager, api_key)
    
    if result['success'] and result.get('response_preview'):
        # Apply post-processing
        original_text = result.get('response_preview', '')
        translated_text = translate_common_english_terms(original_text)
        
        # Recalculate Hebrew percentage after translation
        hebrew_count_after = count_hebrew_chars(translated_text)
        total_chars_after = len(translated_text)
        hebrew_percentage_after = calculate_hebrew_percentage(translated_text)
        
        result['post_processing'] = {
            'hebrew_percentage_before': result['hebrew_percentage'],
            'hebrew_percentage_after': hebrew_percentage_after,
            'improvement': hebrew_percentage_after - result['hebrew_percentage']
        }
    
    return result

def test_option(option_name: str, build_func, template: AIPromptTemplate, variables: dict, provider_manager: LLMProviderManager, api_key: str, system_instruction: str = None):
    """Test a specific option and return results"""
    logger.info(f"Testing {option_name}...")
    
    try:
        # Build prompt
        prompt = build_func(template, variables)
        
        # If system instruction provided, prepend it
        if system_instruction:
            prompt = system_instruction + "\n\n" + prompt
        
        # Send to LLM
        response = provider_manager.send_prompt('gemini', prompt, api_key, max_tokens=4000)
        
        if response.get('error'):
            logger.error(f"{option_name} failed: {response.get('error')}")
            return {
                'option': option_name,
                'success': False,
                'error': response.get('error'),
                'hebrew_percentage': 0.0,
                'response_length': 0
            }
        
        response_text = response.get('text', '')
        if not response_text:
            logger.error(f"{option_name} failed: No response text")
            return {
                'option': option_name,
                'success': False,
                'error': 'No response text',
                'hebrew_percentage': 0.0,
                'response_length': 0
            }
        
        # Calculate Hebrew percentage
        hebrew_percentage = calculate_hebrew_percentage(response_text)
        hebrew_count = count_hebrew_chars(response_text)
        total_chars = len(response_text)
        
        logger.info(f"{option_name} completed: {hebrew_percentage:.1f}% Hebrew")
        
        return {
            'option': option_name,
            'success': True,
            'hebrew_percentage': hebrew_percentage,
            'hebrew_count': hebrew_count,
            'total_chars': total_chars,
            'response_preview': response_text[:500],
            'meets_target': hebrew_percentage >= 95.0
        }
        
    except Exception as e:
        logger.error(f"{option_name} failed with exception: {e}", exc_info=True)
        return {
            'option': option_name,
            'success': False,
            'error': str(e),
            'hebrew_percentage': 0.0,
            'response_length': 0
        }

def main():
    """Run all tests"""
    print("=" * 80)
    print("🧪 בדיקת אופציות שונות לקבלת משוב בעברית")
    print("=" * 80)
    print()
    
    # Setup database and get template
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    template = session.scalars(select(AIPromptTemplate).where(AIPromptTemplate.id == 1)).first()
    if not template:
        print("❌ Template not found")
        session.close()
        return
    
    # Get API key
    from models.ai_analysis import UserLLMProvider
    from services.api_key_encryption_service import APIKeyEncryptionService
    
    user_provider = session.scalars(select(UserLLMProvider).where(UserLLMProvider.user_id == 1)).first()
    if not user_provider or not user_provider.gemini_api_key:
        print("❌ Gemini API key not found")
        session.close()
        return
    
    encryption_service = APIKeyEncryptionService()
    api_key = encryption_service.decrypt_api_key(user_provider.gemini_api_key) if user_provider.gemini_api_key_encrypted else user_provider.gemini_api_key
    
    # Setup provider manager
    provider_manager = LLMProviderManager()
    
    # Test all options
    results = []
    
    print("📊 Testing Option 1: Strong instruction at beginning and end...")
    results.append(test_option(
        "Option 1: Strong Instruction",
        build_prompt_option_1,
        template,
        TEST_VARIABLES,
        provider_manager,
        api_key
    ))
    
    print("\n📊 Testing Option 2: Translate part of template + instruction...")
    results.append(test_option(
        "Option 2: Partial Hebrew Translation",
        build_prompt_option_2,
        template,
        TEST_VARIABLES,
        provider_manager,
        api_key
    ))
    
    print("\n📊 Testing Option 3: Full Hebrew instruction + example...")
    results.append(test_option(
        "Option 3: Hebrew Example",
        build_prompt_option_3,
        template,
        TEST_VARIABLES,
        provider_manager,
        api_key
    ))
    
    print("\n📊 Testing Option 4: Translate entire structure section...")
    results.append(test_option(
        "Option 4: Full Structure Translation",
        build_prompt_option_4,
        template,
        TEST_VARIABLES,
        provider_manager,
        api_key
    ))
    
    print("\n📊 Testing Option 5: Strong instruction + Hebrew example...")
    results.append(test_option(
        "Option 5: Strong Instruction + Example",
        build_prompt_option_5,
        template,
        TEST_VARIABLES,
        provider_manager,
        api_key
    ))
    
    print("\n📊 Testing Option 6: Full Hebrew prompt translation...")
    results.append(test_option(
        "Option 6: Full Hebrew Translation",
        build_prompt_option_6,
        template,
        TEST_VARIABLES,
        provider_manager,
        api_key
    ))
    
    print("\n📊 Testing Option 7: Option 5 + Structure translation...")
    results.append(test_option(
        "Option 7: Combined (Instruction + Example + Structure)",
        build_prompt_option_7,
        template,
        TEST_VARIABLES,
        provider_manager,
        api_key
    ))
    
    print("\n📊 Testing Option 8: Full Hebrew + Instruction + Example...")
    results.append(test_option(
        "Option 8: Full Hebrew + Instruction + Example",
        build_prompt_option_8,
        template,
        TEST_VARIABLES,
        provider_manager,
        api_key
    ))
    
    print("\n📊 Testing Option 9: Full Hebrew + Multiple reminders...")
    results.append(test_option(
        "Option 9: Full Hebrew + Multiple Reminders",
        build_prompt_option_9,
        template,
        TEST_VARIABLES,
        provider_manager,
        api_key
    ))
    
    print("\n📊 Testing Option 10: Option 9 + Explicitly forbid English...")
    results.append(test_option(
        "Option 10: Full Hebrew + Explicit Forbid English",
        build_prompt_option_10,
        template,
        TEST_VARIABLES,
        provider_manager,
        api_key
    ))
    
    print("\n📊 Testing Option 11: Option 10 + System instruction...")
    system_instruction = "You are a Hebrew-speaking financial analyst. You MUST respond ONLY in Hebrew. כל התשובה שלך חייבת להיות בעברית בלבד."
    results.append(test_option(
        "Option 11: Option 10 + System Instruction",
        build_prompt_option_10,
        template,
        TEST_VARIABLES,
        provider_manager,
        api_key,
        system_instruction
    ))
    
    session.close()
    
    # Print results
    print("\n" + "=" * 80)
    print("📊 תוצאות הבדיקות")
    print("=" * 80)
    print()
    
    for result in results:
        print(f"📋 {result['option']}:")
        if result['success']:
            print(f"   ✅ הצלחה!")
            print(f"   - אחוז עברית: {result['hebrew_percentage']:.1f}%")
            print(f"   - תווים עבריים: {result['hebrew_count']} מתוך {result['total_chars']}")
            print(f"   - עומד ביעד (95%+): {'✅ כן' if result['meets_target'] else '❌ לא'}")
            print(f"   - תצוגה מקדימה (200 תווים):")
            print(f"     {result['response_preview'][:200]}...")
        else:
            print(f"   ❌ נכשל: {result.get('error', 'Unknown error')}")
        print()
    
    # Find best option
    successful_results = [r for r in results if r['success']]
    if successful_results:
        best_result = max(successful_results, key=lambda x: x['hebrew_percentage'])
        print("=" * 80)
        print(f"🏆 האופציה הטובה ביותר: {best_result['option']}")
        print(f"   - אחוז עברית: {best_result['hebrew_percentage']:.1f}%")
        print(f"   - עומד ביעד (95%+): {'✅ כן' if best_result['meets_target'] else '❌ לא'}")
        print()
        print("📊 סיכום כל האופציות (מסודר לפי אחוז עברית):")
        sorted_results = sorted(successful_results, key=lambda x: x['hebrew_percentage'], reverse=True)
        for i, res in enumerate(sorted_results, 1):
            print(f"   {i}. {res['option']}: {res['hebrew_percentage']:.1f}% עברית")
        print()
        print("💡 המלצה:")
        if best_result['hebrew_percentage'] >= 95.0:
            print(f"   ✅ האופציה {best_result['option']} עומדת ביעד של 95%+")
        else:
            print(f"   ⚠️ אף אופציה לא הגיעה ל-95%+")
            print(f"   💡 האופציה הטובה ביותר היא {best_result['option']} עם {best_result['hebrew_percentage']:.1f}%")
            print(f"   💡 ניתן לשקול שילוב של כמה אופציות או post-processing")
        print("=" * 80)
    else:
        print("=" * 80)
        print("❌ כל האופציות נכשלו")
        print("=" * 80)

if __name__ == "__main__":
    main()

