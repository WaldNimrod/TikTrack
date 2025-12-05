"""
AI Analysis Error Codes
=======================
Error codes and user-friendly messages for AI Analysis system

Date: 2025-12-04
"""

from typing import Dict, Optional, Tuple

# Error code constants
class AIAnalysisErrorCodes:
    """Error codes for AI Analysis system"""
    
    # Provider errors (1xxx)
    PROVIDER_API_KEY_MISSING = "AI_1001"
    PROVIDER_API_KEY_INVALID = "AI_1002"
    PROVIDER_API_KEY_EXPIRED = "AI_1003"
    PROVIDER_RATE_LIMIT = "AI_1004"
    PROVIDER_TIMEOUT = "AI_1005"
    PROVIDER_SERVICE_UNAVAILABLE = "AI_1006"
    PROVIDER_QUOTA_EXCEEDED = "AI_1007"
    PROVIDER_INVALID_RESPONSE = "AI_1008"
    PROVIDER_NO_RESPONSE = "AI_1009"
    
    # Template errors (2xxx)
    TEMPLATE_NOT_FOUND = "AI_2001"
    TEMPLATE_INVALID = "AI_2002"
    TEMPLATE_VARIABLES_MISSING = "AI_2003"
    TEMPLATE_VARIABLES_INVALID = "AI_2004"
    
    # Validation errors (3xxx)
    VALIDATION_FAILED = "AI_3001"
    VALIDATION_MISSING_TEMPLATE_ID = "AI_3002"
    VALIDATION_MISSING_VARIABLES = "AI_3003"
    VALIDATION_INVALID_PROVIDER = "AI_3004"
    VALIDATION_INVALID_STATUS = "AI_3005"
    
    # Request errors (4xxx)
    REQUEST_NOT_FOUND = "AI_4001"
    REQUEST_NOT_FAILED = "AI_4002"
    REQUEST_MAX_RETRIES_EXCEEDED = "AI_4003"
    REQUEST_INVALID_VARIABLES = "AI_4004"
    
    # User errors (5xxx)
    USER_NOT_AUTHENTICATED = "AI_5001"
    USER_PROVIDER_SETTINGS_MISSING = "AI_5002"
    USER_NO_API_KEYS = "AI_5003"
    
    # System errors (9xxx)
    SYSTEM_ERROR = "AI_9001"
    SYSTEM_DATABASE_ERROR = "AI_9002"
    SYSTEM_UNKNOWN_ERROR = "AI_9999"


# User-friendly error messages (Hebrew)
ERROR_MESSAGES: Dict[str, Dict[str, str]] = {
    # Provider errors
    AIAnalysisErrorCodes.PROVIDER_API_KEY_MISSING: {
        'he': 'מפתח API חסר. נא להגדיר מפתח API בהגדרות המשתמש.',
        'en': 'API key is missing. Please configure API key in user settings.',
        'action': 'configure_api_key'
    },
    AIAnalysisErrorCodes.PROVIDER_API_KEY_INVALID: {
        'he': 'מפתח API לא תקין. נא לבדוק את המפתח ולהגדיר אותו מחדש.',
        'en': 'API key is invalid. Please check and reconfigure the API key.',
        'action': 'reconfigure_api_key'
    },
    AIAnalysisErrorCodes.PROVIDER_API_KEY_EXPIRED: {
        'he': 'מפתח API פג תוקף. נא להגדיר מפתח API חדש.',
        'en': 'API key has expired. Please configure a new API key.',
        'action': 'renew_api_key'
    },
    AIAnalysisErrorCodes.PROVIDER_RATE_LIMIT: {
        'he': 'חרגת ממגבלת הבקשות. נא לנסות שוב בעוד כמה דקות.',
        'en': 'Rate limit exceeded. Please try again in a few minutes.',
        'action': 'retry_later'
    },
    AIAnalysisErrorCodes.PROVIDER_TIMEOUT: {
        'he': 'הבקשה ארכה יותר מדי זמן. נא לנסות שוב.',
        'en': 'Request timed out. Please try again.',
        'action': 'retry'
    },
    AIAnalysisErrorCodes.PROVIDER_SERVICE_UNAVAILABLE: {
        'he': 'שירות ה-AI לא זמין כרגע. נא לנסות שוב מאוחר יותר.',
        'en': 'AI service is currently unavailable. Please try again later.',
        'action': 'retry_later'
    },
    AIAnalysisErrorCodes.PROVIDER_QUOTA_EXCEEDED: {
        'he': 'חרגת ממכסת הבקשות החודשית. נא לבדוק את המכסה שלך.',
        'en': 'Monthly quota exceeded. Please check your quota.',
        'action': 'check_quota'
    },
    AIAnalysisErrorCodes.PROVIDER_INVALID_RESPONSE: {
        'he': 'התגובה מהשירות לא תקינה. נא לנסות שוב.',
        'en': 'Invalid response from service. Please try again.',
        'action': 'retry'
    },
    AIAnalysisErrorCodes.PROVIDER_NO_RESPONSE: {
        'he': 'לא התקבלה תגובה מהשירות. נא לנסות שוב.',
        'en': 'No response received from service. Please try again.',
        'action': 'retry'
    },
    
    # Template errors
    AIAnalysisErrorCodes.TEMPLATE_NOT_FOUND: {
        'he': 'תבנית הניתוח לא נמצאה. נא לבדוק את התבנית שנבחרה.',
        'en': 'Analysis template not found. Please check the selected template.',
        'action': 'select_template'
    },
    AIAnalysisErrorCodes.TEMPLATE_INVALID: {
        'he': 'תבנית הניתוח לא תקינה. נא לבחור תבנית אחרת.',
        'en': 'Analysis template is invalid. Please select another template.',
        'action': 'select_template'
    },
    AIAnalysisErrorCodes.TEMPLATE_VARIABLES_MISSING: {
        'he': 'חסרים משתנים נדרשים לתבנית. נא למלא את כל השדות הנדרשים.',
        'en': 'Required template variables are missing. Please fill all required fields.',
        'action': 'fill_variables'
    },
    AIAnalysisErrorCodes.TEMPLATE_VARIABLES_INVALID: {
        'he': 'משתני התבנית לא תקינים. נא לבדוק את הערכים שהוזנו.',
        'en': 'Template variables are invalid. Please check the entered values.',
        'action': 'check_variables'
    },
    
    # Validation errors
    AIAnalysisErrorCodes.VALIDATION_FAILED: {
        'he': 'הבקשה לא עברה ולידציה. נא לבדוק את הנתונים שהוזנו.',
        'en': 'Request validation failed. Please check the entered data.',
        'action': 'check_data'
    },
    AIAnalysisErrorCodes.VALIDATION_MISSING_TEMPLATE_ID: {
        'he': 'חסר מזהה תבנית. נא לבחור תבנית ניתוח.',
        'en': 'Template ID is missing. Please select an analysis template.',
        'action': 'select_template'
    },
    AIAnalysisErrorCodes.VALIDATION_MISSING_VARIABLES: {
        'he': 'חסרים משתנים. נא למלא את כל השדות הנדרשים.',
        'en': 'Variables are missing. Please fill all required fields.',
        'action': 'fill_variables'
    },
    AIAnalysisErrorCodes.VALIDATION_INVALID_PROVIDER: {
        'he': 'ספק AI לא תקין. נא לבחור ספק תקין (Gemini או Perplexity).',
        'en': 'Invalid AI provider. Please select a valid provider (Gemini or Perplexity).',
        'action': 'select_provider'
    },
    AIAnalysisErrorCodes.VALIDATION_INVALID_STATUS: {
        'he': 'סטטוס לא תקין. נא לבדוק את הבקשה.',
        'en': 'Invalid status. Please check the request.',
        'action': 'check_request'
    },
    
    # Request errors
    AIAnalysisErrorCodes.REQUEST_NOT_FOUND: {
        'he': 'בקשת הניתוח לא נמצאה.',
        'en': 'Analysis request not found.',
        'action': 'check_request_id'
    },
    AIAnalysisErrorCodes.REQUEST_NOT_FAILED: {
        'he': 'הבקשה לא נכשלה. ניתן לנסות שוב רק לבקשות שנכשלו.',
        'en': 'Request did not fail. Retry is only available for failed requests.',
        'action': 'check_status'
    },
    AIAnalysisErrorCodes.REQUEST_MAX_RETRIES_EXCEEDED: {
        'he': 'חרגת ממספר הניסיונות המרבי. נא לנסות ליצור ניתוח חדש.',
        'en': 'Maximum retry attempts exceeded. Please create a new analysis.',
        'action': 'create_new'
    },
    AIAnalysisErrorCodes.REQUEST_INVALID_VARIABLES: {
        'he': 'נתוני המשתנים לא תקינים. נא לבדוק את הנתונים.',
        'en': 'Variable data is invalid. Please check the data.',
        'action': 'check_data'
    },
    
    # User errors
    AIAnalysisErrorCodes.USER_NOT_AUTHENTICATED: {
        'he': 'נדרש התחברות. נא להתחבר למערכת.',
        'en': 'Authentication required. Please log in.',
        'action': 'login'
    },
    AIAnalysisErrorCodes.USER_PROVIDER_SETTINGS_MISSING: {
        'he': 'הגדרות ספק AI חסרות. נא להגדיר מפתחות API בהגדרות המשתמש.',
        'en': 'AI provider settings are missing. Please configure API keys in user settings.',
        'action': 'configure_api_keys'
    },
    AIAnalysisErrorCodes.USER_NO_API_KEYS: {
        'he': 'לא הוגדרו מפתחות API. נא להגדיר מפתחות API בהגדרות המשתמש.',
        'en': 'No API keys configured. Please configure API keys in user settings.',
        'action': 'configure_api_keys'
    },
    
    # System errors
    AIAnalysisErrorCodes.SYSTEM_ERROR: {
        'he': 'אירעה שגיאת מערכת. נא לנסות שוב מאוחר יותר.',
        'en': 'A system error occurred. Please try again later.',
        'action': 'retry_later'
    },
    AIAnalysisErrorCodes.SYSTEM_DATABASE_ERROR: {
        'he': 'שגיאת בסיס נתונים. נא לנסות שוב מאוחר יותר.',
        'en': 'Database error. Please try again later.',
        'action': 'retry_later'
    },
    AIAnalysisErrorCodes.SYSTEM_UNKNOWN_ERROR: {
        'he': 'אירעה שגיאה לא ידועה. נא לנסות שוב או ליצור קשר עם התמיכה.',
        'en': 'An unknown error occurred. Please try again or contact support.',
        'action': 'contact_support'
    }
}


def get_error_message(error_code: str, language: str = 'he') -> Tuple[str, Optional[str]]:
    """
    Get user-friendly error message for error code
    
    Args:
        error_code: Error code (e.g., 'AI_1001')
        language: Language code ('he' for Hebrew, 'en' for English)
        
    Returns:
        Tuple of (message, action)
    """
    error_info = ERROR_MESSAGES.get(error_code)
    if not error_info:
        # Fallback for unknown error codes
        if language == 'he':
            return ('שגיאה לא ידועה', None)
        else:
            return ('Unknown error', None)
    
    message = error_info.get(language, error_info.get('en', 'Unknown error'))
    action = error_info.get('action')
    
    return message, action


def categorize_error(error: Exception, error_message: str = None) -> str:
    """
    Categorize error and return appropriate error code
    
    Args:
        error: Exception object
        error_message: Error message string
        
    Returns:
        Error code string
    """
    error_str = str(error).lower()
    error_msg = (error_message or '').lower()
    combined = f"{error_str} {error_msg}".lower()
    
    # Provider errors
    if 'api key' in combined or 'apikey' in combined:
        if 'missing' in combined or 'not found' in combined or 'not configured' in combined:
            return AIAnalysisErrorCodes.PROVIDER_API_KEY_MISSING
        elif 'invalid' in combined or 'invalid' in combined:
            return AIAnalysisErrorCodes.PROVIDER_API_KEY_INVALID
        elif 'expired' in combined:
            return AIAnalysisErrorCodes.PROVIDER_API_KEY_EXPIRED
    
    if 'rate limit' in combined or 'too many requests' in combined:
        return AIAnalysisErrorCodes.PROVIDER_RATE_LIMIT
    
    if 'timeout' in combined or 'timed out' in combined:
        return AIAnalysisErrorCodes.PROVIDER_TIMEOUT
    
    if 'quota' in combined or 'limit exceeded' in combined:
        return AIAnalysisErrorCodes.PROVIDER_QUOTA_EXCEEDED
    
    if 'service unavailable' in combined or '503' in combined:
        return AIAnalysisErrorCodes.PROVIDER_SERVICE_UNAVAILABLE
    
    if 'no response' in combined or 'empty response' in combined:
        return AIAnalysisErrorCodes.PROVIDER_NO_RESPONSE
    
    # Template errors
    if 'template' in combined:
        if 'not found' in combined:
            return AIAnalysisErrorCodes.TEMPLATE_NOT_FOUND
        elif 'invalid' in combined:
            return AIAnalysisErrorCodes.TEMPLATE_INVALID
        elif 'variables' in combined:
            if 'missing' in combined:
                return AIAnalysisErrorCodes.TEMPLATE_VARIABLES_MISSING
            elif 'invalid' in combined:
                return AIAnalysisErrorCodes.TEMPLATE_VARIABLES_INVALID
    
    # Validation errors
    if 'validation' in combined or 'validate' in combined:
        return AIAnalysisErrorCodes.VALIDATION_FAILED
    
    # User errors
    if 'user' in combined and ('not found' in combined or 'missing' in combined):
        if 'provider' in combined or 'api key' in combined:
            return AIAnalysisErrorCodes.USER_PROVIDER_SETTINGS_MISSING
        return AIAnalysisErrorCodes.USER_NOT_AUTHENTICATED
    
    # Database errors
    if 'database' in combined or 'sql' in combined or 'db' in combined:
        return AIAnalysisErrorCodes.SYSTEM_DATABASE_ERROR
    
    # Default to unknown error
    return AIAnalysisErrorCodes.SYSTEM_UNKNOWN_ERROR


def format_error_response(error_code: str, original_message: str = None, 
                         language: str = 'he', **kwargs) -> Dict[str, any]:
    """
    Format error response with error code and user-friendly message
    
    Args:
        error_code: Error code
        original_message: Original error message (for logging)
        language: Language code ('he' or 'en')
        **kwargs: Additional fields to include
        
    Returns:
        Dictionary with error response
    """
    user_message, action = get_error_message(error_code, language)
    
    response = {
        'error_code': error_code,
        'message': user_message,
        'original_message': original_message,  # For debugging
        'action': action
    }
    
    response.update(kwargs)
    
    return response

