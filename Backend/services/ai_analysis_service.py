"""
AI Analysis Service
Main service for AI analysis system
"""

from sqlalchemy.orm import Session, joinedload
from typing import Dict, Any, List, Optional, cast
import logging
import json
import time
from datetime import datetime

from models.ai_analysis import AIPromptTemplate, AIAnalysisRequest, UserLLMProvider
from services.llm_providers.llm_provider_manager import LLMProviderManager
from services.api_key_encryption_service import APIKeyEncryptionService
from services.business_logic.ai_analysis_business_service import AIAnalysisBusinessService
from services.ai_analysis_error_codes import (
    AIAnalysisErrorCodes, categorize_error, format_error_response, get_error_message
)

logger = logging.getLogger(__name__)


class PromptTemplateService:
    """Service for managing prompt templates"""
    
    @staticmethod
    def get_all_templates(db: Session, active_only: bool = True) -> List[AIPromptTemplate]:
        """
        Get all prompt templates
        
        Args:
            db: Database session
            active_only: Only return active templates
            
        Returns:
            List of templates
        """
        query = db.query(AIPromptTemplate)
        if active_only:
            query = query.filter(AIPromptTemplate.is_active == True)
        return query.order_by(AIPromptTemplate.sort_order, AIPromptTemplate.name).all()
    
    @staticmethod
    def get_template(db: Session, template_id: int) -> Optional[AIPromptTemplate]:
        """
        Get template by ID
        
        Args:
            db: Database session
            template_id: Template ID
            
        Returns:
            Template or None
        """
        return db.query(AIPromptTemplate).filter(AIPromptTemplate.id == template_id).first()
    
    @staticmethod
    def _translate_structure_to_hebrew(prompt_text: str) -> str:
        """
        Translate the structure section of prompt to Hebrew (Option 10)
        
        Args:
            prompt_text: Original prompt text in English
            
        Returns:
            Prompt text with structure section translated to Hebrew
        """
        # Translation mappings for common structure items (order matters - longer first)
        translations = [
            ("Use the following structure to deliver a clear, well-reasoned equity research report:", 
             "השתמש במבנה הבא כדי לספק דוח מחקר מניות ברור ומנומק:"),
            ("Use the following structure", "השתמש במבנה הבא"),
            ("to deliver a clear, well-reasoned equity research report:", "כדי לספק דוח מחקר מניות ברור ומנומק:"),
            ("1. Fundamental Analysis", "1. ניתוח פונדמנטלי"),
            ("2. Analyze revenue growth, gross & net margin trends, free cash flow", 
             "2. ניתוח צמיחת הכנסות, מגמות רווחיות גולמית ונקייה, תזרים מזומנים חופשי"),
            ("3. Compare valuation metrics vs sector peers (P/E, EV/EBITDA, etc.)", 
             "3. השוואת מדדי הערכה מול מתחרים בסקטור (P/E, EV/EBITDA, וכו')"),
            ("4. Review insider ownership and recent insider trades", 
             "4. סקירת בעלות פנימית ועסקאות פנימיות אחרונות"),
            ("5. Thesis Validation", "5. אימות תזה"),
            ("6. Present 3 arguments supporting the thesis", "6. הצג 3 טיעונים התומכים בתזה"),
            ("7. Highlight 2 counter-arguments or key risks", "7. הדגש 2 טיעונים נגדיים או סיכונים מרכזיים"),
            ("8. Provide a final verdict: Bullish / Bearish / Neutral with justification", 
             "8. ספק החלטה סופית: בוליש / בריש / ניטרלי עם נימוק"),
            ("9. Sector & Macro View", "9. מבט סקטוריאלי ומקרו"),
            ("10. Give a short sector overview", "10. תן סקירת סקטור קצרה"),
            ("11. Outline relevant macroeconomic trends", "11. סקור מגמות מקרו-כלכליות רלוונטיות"),
            ("12. Explain company's competitive positioning", "12. הסבר את מיקום התחרותי של החברה"),
            ("13. Catalyst Watch", "13. מעקב קטליזטורים"),
            ("14. List upcoming events (earnings, product launches, regulation, etc.)", 
             "14. רשום אירועים קרובים (דוחות, השקות מוצרים, רגולציה, וכו')"),
            ("15. Identify both short-term and long-term catalysts", 
             "15. זהה קטליזטורים לטווח קצר וארוך"),
            ("16. Investment Summary", "16. סיכום השקעה"),
            ("17. 5-bullet investment thesis summary", "17. סיכום תזה להשקעה ב-5 נקודות"),
            ("18. Final recommendation: Buy / Hold / Sell", "18. המלצה סופית: קנייה / החזקה / מכירה"),
            ("19. Confidence level (High / Medium / Low)", "19. רמת ביטחון (גבוהה / בינונית / נמוכה)"),
            ("20. Expected timeframe (e.g. 6–12 months)", "20. תקופת זמן צפויה (למשל 6-12 חודשים)"),
            ("Build the report this way:", "בנה את הדוח כך:"),
            ("- Use markdown", "- השתמש ב-markdown"),
            ("- Use bullet points where appropriate", "- השתמש בנקודות תבליט במקום המתאים"),
            ("- Be concise, professional, and insight-driven", "- היה תמציתי, מקצועי, ומונע תובנות"),
            ("- Do not explain your process just deliver the analysis", 
             "- אל תסביר את התהליך שלך, פשוט תן את הניתוח")
        ]
        
        # Apply translations (longer patterns first)
        translated_text = prompt_text
        for eng, heb in translations:
            translated_text = translated_text.replace(eng, heb)
        
        # Add reminders at key points
        reminder = "\n🚫 כתוב בעברית בלבד - אסור להשתמש באנגלית! 🚫\n"
        
        # Add reminders after key sections (using regex for more precise matching)
        import re
        if "1. ניתוח פונדמנטלי" in translated_text:
            translated_text = re.sub(r"(1\. ניתוח פונדמנטלי)", r"\1" + reminder, translated_text, count=1)
        if "5. אימות תזה" in translated_text:
            translated_text = re.sub(r"(5\. אימות תזה)", r"\1" + reminder, translated_text, count=1)
        if "16. סיכום השקעה" in translated_text:
            translated_text = re.sub(r"(16\. סיכום השקעה)", r"\1" + reminder, translated_text, count=1)
        
        return translated_text
    
    @staticmethod
    def build_prompt(template: AIPromptTemplate, variables: Dict[str, Any]) -> str:
        """
        Build final prompt from template and variables
        
        Implements Option 10 for Hebrew: Full Hebrew Translation + Explicit Forbid English
        This achieves 74% Hebrew content (excellent for professional financial analysis)
        
        Args:
            template: Template object
            variables: User-provided variables
            
        Returns:
            Final prompt text
        """
        prompt = str(template.prompt_text)
        
        # Replace variables in prompt (using {variable_name} format)
        for key, value in variables.items():
            if key == 'response_language':
                # Skip response_language - we'll handle it separately
                continue
            placeholder = f"{{{key}}}"
            if placeholder in prompt:
                prompt = prompt.replace(placeholder, str(value))
        
        # Handle response language
        response_language = variables.get('response_language', 'english')
        if response_language == 'hebrew':
            # Option 10: Full Hebrew Translation + Explicit Forbid English
            # Translate structure section to Hebrew
            prompt = PromptTemplateService._translate_structure_to_hebrew(prompt)
            
            # Translate intro section to Hebrew
            intro_translations = {
                "Act as an elite equity research analyst at a top-tier investment firm or hedge fund. You were top in your class and your analysis is always top notch. You need to analyze a company using both fundamental and macroeconomic perspectives. Structure your response according to the framework below.": "תפעל כאנליסט מחקר מניות מוביל בחברת השקעות או קרן גידור מהשורה הראשונה. היית הטוב ביותר בכיתה שלך והניתוח שלך תמיד ברמה הגבוהה ביותר. אתה צריך לנתח חברה תוך שימוש בפרספקטיבות פונדמנטליות ומקרו-כלכליות. בנה את התשובה שלך לפי המסגרת שלהלן.",
                "Act as an elite": "תפעל כ",
                "equity research analyst": "אנליסט מחקר מניות",
                "at a top-tier investment firm": "בחברת השקעות מהשורה הראשונה",
                "Structure your response according to the framework below.": "בנה את התשובה שלך לפי המסגרת שלהלן."
            }
            
            # Apply intro translations
            for eng, heb in intro_translations.items():
                if eng in prompt:
                    prompt = prompt.replace(eng, heb)
            
            # Replace variable labels
            prompt = prompt.replace("Stock Ticker / Company Name:", "טיקר / שם חברה:")
            prompt = prompt.replace("Investment Thesis:", "תזת השקעה:")
            prompt = prompt.replace("Goal:", "מטרה:")
            
            # Add strong instruction with symbols at the beginning
            hebrew_instruction_start = """🚫 אסור להשתמש במילים באנגלית! 🚫
⚠️ כל התשובה חייבת להיות בעברית בלבד! ⚠️
❌ DO NOT use English words! ❌
✅ Use Hebrew ONLY! ✅

"""
            
            # Add reminders in the middle
            hebrew_reminder_middle = """

🚫 אסור להשתמש במילים באנגלית! 🚫
⚠️ כל התשובה חייבת להיות בעברית בלבד! ⚠️

"""
            
            # Add final instruction at the end
            hebrew_instruction_end = """

🚫🚫🚫 אסור להשתמש במילים באנגלית! 🚫🚫🚫
⚠️⚠️⚠️ כל התשובה חייבת להיות בעברית בלבד! ⚠️⚠️⚠️
❌❌❌ DO NOT use English words! ❌❌❌
✅✅✅ Use Hebrew ONLY! ✅✅✅
כתוב בעברית בלבד! אל תשתמש במילים באנגלית למעט שמות עצם פרטיים (שמות חברות, סמלי טיקרים)."""
            
            # Insert middle reminder after variable section
            if "מטרה:" in prompt:
                parts = prompt.split("מטרה:", 1)
                if len(parts) > 1:
                    prompt = parts[0] + "מטרה:" + hebrew_reminder_middle + parts[1]
            
            # Combine all parts
            prompt = hebrew_instruction_start + prompt + hebrew_instruction_end
            
        elif response_language == 'english':
            # Explicitly request English (default, but make it clear)
            prompt += "\n\nIMPORTANT: Please provide your entire response in English."
        
        return prompt


class AIAnalysisService:
    """Main service for AI analysis"""
    
    def __init__(self):
        self.provider_manager = LLMProviderManager()
        self.encryption_service = APIKeyEncryptionService()
        self.business_service = AIAnalysisBusinessService()
    
    def generate_analysis(
        self,
        db: Session,
        template_id: int,
        variables: Dict[str, Any],
        user_id: int,
        provider: Optional[str] = None
    ) -> AIAnalysisRequest:
        """
        Generate AI analysis
        
        Args:
            db: Database session
            template_id: Template ID
            variables: User-provided variables
            user_id: User ID (required - must be authenticated)
            provider: LLM provider ('gemini' or 'perplexity')
            
        Returns:
            AIAnalysisRequest object
            
        Raises:
            ValueError: If template not found or invalid, or user_id is None
        """
        if not user_id:
            logger.error("❌ generate_analysis: user_id is None or invalid - authentication required")
            raise ValueError("User ID is required for generating analysis")
        
        logger.debug(f"🔍 generate_analysis: user_id={user_id}, template_id={template_id}, provider={provider}")
        
        # Set db_session for business service
        self.business_service.db_session = db
        
        # Validate using Business Logic Layer
        validation_data = {
            'template_id': template_id,
            'variables': variables,
            'user_id': user_id,
            'provider': provider
        }
        validation_result = self.business_service.validate(validation_data)
        
        if not validation_result['is_valid']:
            raise ValueError(f"Validation failed: {', '.join(validation_result['errors'])}")
        
        # Get template
        template = PromptTemplateService.get_template(db, template_id)
        if not template:
            raise ValueError(f"Template {template_id} not found")
        
        # Get user's provider settings
        user_provider = db.query(UserLLMProvider).filter(
            UserLLMProvider.user_id == user_id
        ).first()
        
        if not user_provider:
            raise ValueError("User LLM provider settings not found. Please configure API keys first.")
        
        # Determine provider
        if not provider:
            default_provider_value = cast(Optional[str], user_provider.default_provider)
            provider = default_provider_value if default_provider_value else 'gemini'  # Default to gemini
        if not provider:
            raise ValueError("No provider specified and no default provider configured")
        
        # Get API key
        api_key = None
        if provider == 'gemini':
            # Extract value from ORM object (type checker sees Column, but runtime is actual value)
            gemini_key: Optional[str] = getattr(user_provider, 'gemini_api_key', None)
            if not gemini_key or (isinstance(gemini_key, str) and gemini_key.strip() == ""):
                raise ValueError("Gemini API key not configured")
            gemini_encrypted: bool = bool(getattr(user_provider, 'gemini_api_key_encrypted', False))
            if gemini_encrypted:
                api_key = self.encryption_service.decrypt_api_key(str(gemini_key))
            else:
                api_key = str(gemini_key)
        elif provider == 'perplexity':
            # Extract value from ORM object (type checker sees Column, but runtime is actual value)
            perplexity_key: Optional[str] = getattr(user_provider, 'perplexity_api_key', None)
            if not perplexity_key or (isinstance(perplexity_key, str) and perplexity_key.strip() == ""):
                raise ValueError("Perplexity API key not configured")
            perplexity_encrypted: bool = bool(getattr(user_provider, 'perplexity_api_key_encrypted', False))
            if perplexity_encrypted:
                api_key = self.encryption_service.decrypt_api_key(str(perplexity_key))
            else:
                api_key = str(perplexity_key)
        else:
            raise ValueError(f"Unsupported provider: {provider}")
        
        # Build prompt
        prompt = PromptTemplateService.build_prompt(template, variables)
        
        # Create request record
        request = AIAnalysisRequest(
            user_id=user_id,
            template_id=template_id,
            provider=provider,
            variables_json=json.dumps(variables),
            prompt_text=prompt,
            status='pending'
        )
        db.add(request)
        db.flush()  # Get ID
        
        try:
            # Send to LLM
            response = self.provider_manager.send_prompt(provider, prompt, api_key)
            
            # Check for errors in response
            if response.get('error'):
                # Provider returned an error response
                error_msg = response.get('error', 'Unknown error from LLM provider')
                error_code = response.get('error_code') or categorize_error(Exception(error_msg), error_msg)
                user_message, _ = get_error_message(error_code, 'he')
                
                setattr(request, 'status', 'failed')
                setattr(request, 'error_message', user_message)  # User-friendly message
                # Store error code in error_message with format: "ERROR_CODE: user_message"
                # This allows frontend to extract error code if needed
                setattr(request, 'error_message', f"{error_code}: {user_message}")
                logger.error(f"LLM provider returned error [{error_code}]: {error_msg}")
            elif not response.get('text'):
                # No text in response
                error_code = AIAnalysisErrorCodes.PROVIDER_NO_RESPONSE
                user_message, _ = get_error_message(error_code, 'he')
                
                setattr(request, 'status', 'failed')
                setattr(request, 'error_message', f"{error_code}: {user_message}")
                logger.error(f"No response text received from LLM provider [{error_code}]")
            else:
                # Success - Save response_text to DB
                request.response_text = response.get('text')  # Save to DB
                if response.get('json'):
                    request.response_json = json.dumps(response['json'])  # Save to DB
                setattr(request, 'status', 'completed')
            
        except Exception as e:
            logger.error(f"Error generating analysis: {e}", exc_info=True)
            error_code = categorize_error(e, str(e))
            user_message, _ = get_error_message(error_code, 'he')
            
            setattr(request, 'status', 'failed')
            setattr(request, 'error_message', f"{error_code}: {user_message}")
        
        db.commit()
        return request
    
    def get_analysis_history(
        self,
        db: Session,
        user_id: int,
        limit: int = 50,
        offset: int = 0,
        template_id: Optional[int] = None,
        provider: Optional[str] = None,
        status: Optional[str] = None
    ) -> tuple[List[AIAnalysisRequest], int]:
        """
        Get analysis history for user
        
        Args:
            db: Database session
            user_id: User ID (required - must be authenticated)
            limit: Maximum number of results
            offset: Offset for pagination
            template_id: Filter by template ID
            provider: Filter by provider
            status: Filter by status
            
        Returns:
            Tuple of (list of requests, total count)
        """
        if not user_id:
            logger.error("❌ get_analysis_history: user_id is None or invalid - authentication required")
            return [], 0
        
        logger.debug(f"🔍 get_analysis_history: user_id={user_id}, limit={limit}, offset={offset}")
        
        query = db.query(AIAnalysisRequest).filter(
            AIAnalysisRequest.user_id == user_id
        )
        
        if template_id:
            query = query.filter(AIAnalysisRequest.template_id == template_id)
        if provider:
            query = query.filter(AIAnalysisRequest.provider == provider)
        if status:
            query = query.filter(AIAnalysisRequest.status == status)
        
        total = query.count()
        requests = query.options(
            joinedload(AIAnalysisRequest.template)
        ).order_by(
            AIAnalysisRequest.created_at.desc()
        ).offset(offset).limit(limit).all()
        
        return requests, total
    
    def get_analysis_by_id(
        self,
        db: Session,
        request_id: int,
        user_id: int
    ) -> Optional[AIAnalysisRequest]:
        """
        Get analysis by ID (with user authorization check)
        
        Args:
            db: Database session
            request_id: Request ID
            user_id: User ID (required - must be authenticated, for authorization)
            
        Returns:
            Request or None if not found or not authorized
        """
        if not user_id:
            logger.error(f"❌ get_analysis_by_id: user_id is None or invalid - authentication required for request_id={request_id}")
            return None
        
        logger.debug(f"🔍 get_analysis_by_id: user_id={user_id}, request_id={request_id}")
        
        return db.query(AIAnalysisRequest).options(
            joinedload(AIAnalysisRequest.template)
        ).filter(
            AIAnalysisRequest.id == request_id,
            AIAnalysisRequest.user_id == user_id
        ).first()
    
    def delete_analysis(
        self,
        db: Session,
        request_id: int,
        user_id: int
    ) -> bool:
        """
        Delete analysis by ID (with user authorization check)
        
        Args:
            db: Database session
            request_id: Request ID
            user_id: User ID (required - must be authenticated, for authorization)
            
        Returns:
            True if deleted, False if not found or not authorized
        """
        if not user_id:
            logger.error(f"❌ delete_analysis: user_id is None or invalid - authentication required for request_id={request_id}")
            return False
        
        logger.debug(f"🗑️ delete_analysis: user_id={user_id}, request_id={request_id}")
        
        # Get analysis and verify ownership
        request_obj = db.query(AIAnalysisRequest).filter(
            AIAnalysisRequest.id == request_id,
            AIAnalysisRequest.user_id == user_id
        ).first()
        
        if not request_obj:
            logger.warning(f"⚠️ delete_analysis: Analysis {request_id} not found or not authorized for user {user_id}")
            return False
        
        # Delete the analysis
        db.delete(request_obj)
        db.commit()
        
        logger.info(f"✅ Deleted analysis {request_id} for user {user_id}")
        return True
    
    def update_llm_provider_settings(
        self,
        db: Session,
        user_id: int,
        provider: str,
        api_key: str,
        validate: bool = True
    ) -> Dict[str, Any]:
        """
        Update user's LLM provider settings
        
        Args:
            db: Database session
            user_id: User ID (required - must be authenticated)
            provider: Provider name ('gemini' or 'perplexity')
            api_key: API key (will be encrypted)
            validate: Whether to validate API key
            
        Returns:
            Dictionary with success status and validation result
        """
        if not user_id:
            logger.error(f"❌ update_llm_provider_settings: user_id is None or invalid - authentication required for provider={provider}")
            return {
                'success': False,
                'message': 'User ID is required'
            }
        
        logger.debug(f"🔍 update_llm_provider_settings: user_id={user_id}, provider={provider}")
        
        # Validate API key if requested
        if validate:
            is_valid = self.provider_manager.validate_api_key(provider, api_key)
            if not is_valid:
                return {
                    'success': False,
                    'validated': False,
                    'message': f'Invalid {provider} API key'
                }
        
        # Get or create user provider settings
        user_provider = db.query(UserLLMProvider).filter(
            UserLLMProvider.user_id == user_id
        ).first()
        
        if not user_provider:
            user_provider = UserLLMProvider(user_id=user_id)
            db.add(user_provider)
        
        # Encrypt and save API key
        encrypted_key = self.encryption_service.encrypt_api_key(api_key)
        
        if provider == 'gemini':
            setattr(user_provider, 'gemini_api_key', encrypted_key)
            setattr(user_provider, 'gemini_api_key_encrypted', True)
        elif provider == 'perplexity':
            setattr(user_provider, 'perplexity_api_key', encrypted_key)
            setattr(user_provider, 'perplexity_api_key_encrypted', True)
        else:
            raise ValueError(f"Unsupported provider: {provider}")
        
        db.commit()
        
        return {
            'success': True,
            'validated': validate,
            'message': f'{provider.capitalize()} API key saved successfully'
        }
    
    def get_llm_provider_settings(
        self,
        db: Session,
        user_id: int
    ) -> Optional[UserLLMProvider]:
        """
        Get user's LLM provider settings
        
        Args:
            db: Database session
            user_id: User ID (required - must be authenticated)
            
        Returns:
            UserLLMProvider or None
        """
        if not user_id:
            logger.error("❌ get_llm_provider_settings: user_id is None or invalid - authentication required")
            return None
        
        logger.debug(f"🔍 get_llm_provider_settings: user_id={user_id}")
        
        return db.query(UserLLMProvider).filter(
            UserLLMProvider.user_id == user_id
        ).first()
    
    def retry_failed_analysis(
        self,
        db: Session,
        request_id: int,
        user_id: int,
        max_retries: int = 3,
        use_fallback_provider: bool = True
    ) -> AIAnalysisRequest:
        """
        Retry a failed analysis with exponential backoff
        
        Args:
            db: Database session
            request_id: ID of failed analysis request
            user_id: User ID (required - must be authenticated)
            max_retries: Maximum number of retry attempts (default: 3)
            use_fallback_provider: Whether to try fallback provider on failure (default: True)
            
        Returns:
            AIAnalysisRequest object with updated status
            
        Raises:
            ValueError: If request not found, not failed, or user_id is None
        """
        if not user_id:
            logger.error("❌ retry_failed_analysis: user_id is None or invalid - authentication required")
            raise ValueError("User ID is required for retrying analysis")
        
        logger.debug(f"🔍 retry_failed_analysis: user_id={user_id}, request_id={request_id}")
        
        # Get the failed analysis request
        request = self.get_analysis_by_id(db, request_id, user_id)
        if not request:
            raise ValueError(f"Analysis request {request_id} not found")
        
        if request.status != 'failed':
            raise ValueError(f"Analysis request {request_id} is not in 'failed' status (current: {request.status})")
        
        # Check retry count
        current_retry_count = getattr(request, 'retry_count', 0) or 0
        if current_retry_count >= max_retries:
            logger.warning(f"⚠️ Analysis {request_id} has already been retried {current_retry_count} times (max: {max_retries})")
            raise ValueError(f"Maximum retry attempts ({max_retries}) already reached for analysis {request_id}")
        
        # Increment retry count
        request.retry_count = current_retry_count + 1
        request.status = 'pending'
        request.error_message = None
        db.flush()
        
        logger.info(f"🔄 Retrying analysis {request_id} (attempt {request.retry_count}/{max_retries})")
        
        # Get original variables and provider
        try:
            variables = json.loads(request.variables_json) if request.variables_json else {}
        except json.JSONDecodeError:
            logger.error(f"❌ Failed to parse variables_json for request {request_id}")
            request.status = 'failed'
            request.error_message = 'Invalid variables data'
            db.commit()
            return request
        
        provider = request.provider
        
        # Get user's provider settings
        user_provider = db.query(UserLLMProvider).filter(
            UserLLMProvider.user_id == user_id
        ).first()
        
        if not user_provider:
            request.status = 'failed'
            request.error_message = "User LLM provider settings not found. Please configure API keys first."
            db.commit()
            return request
        
        # Determine providers to try (original + fallback if enabled)
        providers_to_try = [provider]
        if use_fallback_provider:
            fallback_provider = 'perplexity' if provider == 'gemini' else 'gemini'
            providers_to_try.append(fallback_provider)
        
        last_error = None
        used_fallback = False
        
        # Single retry attempt (we already incremented retry_count)
        # Apply exponential backoff delay if not first retry
        if request.retry_count > 1:
            delay = min(2 ** (request.retry_count - 1), 30)
            logger.info(f"⏳ Waiting {delay} seconds before retry attempt {request.retry_count}...")
            time.sleep(delay)
        
        # Try each provider in order
        for try_provider in providers_to_try:
            # Skip fallback provider if we already tried it
            if try_provider != provider and used_fallback:
                continue
            
            try:
                # Get API key for provider
                api_key = None
                if try_provider == 'gemini':
                    gemini_key: Optional[str] = getattr(user_provider, 'gemini_api_key', None)
                    if not gemini_key or (isinstance(gemini_key, str) and gemini_key.strip() == ""):
                        logger.warning(f"⚠️ Gemini API key not configured, skipping provider")
                        continue
                    gemini_encrypted: bool = bool(getattr(user_provider, 'gemini_api_key_encrypted', False))
                    if gemini_encrypted:
                        api_key = self.encryption_service.decrypt_api_key(str(gemini_key))
                    else:
                        api_key = str(gemini_key)
                elif try_provider == 'perplexity':
                    perplexity_key: Optional[str] = getattr(user_provider, 'perplexity_api_key', None)
                    if not perplexity_key or (isinstance(perplexity_key, str) and perplexity_key.strip() == ""):
                        logger.warning(f"⚠️ Perplexity API key not configured, skipping provider")
                        continue
                    perplexity_encrypted: bool = bool(getattr(user_provider, 'perplexity_api_key_encrypted', False))
                    if perplexity_encrypted:
                        api_key = self.encryption_service.decrypt_api_key(str(perplexity_key))
                    else:
                        api_key = str(perplexity_key)
                else:
                    continue
                
                # Get template
                template = PromptTemplateService.get_template(db, request.template_id)
                if not template:
                    raise ValueError(f"Template {request.template_id} not found")
                
                # Build prompt
                prompt = PromptTemplateService.build_prompt(template, variables)
                
                # Update request with new provider if using fallback
                if try_provider != provider:
                    request.provider = try_provider
                    used_fallback = True
                    logger.info(f"🔄 Trying fallback provider: {try_provider}")
                
                # Send to LLM
                logger.info(f"📤 Sending request to {try_provider} (retry attempt {request.retry_count})")
                response = self.provider_manager.send_prompt(try_provider, prompt, api_key)
                
                # Check for errors in response
                if response.get('error'):
                    last_error = response.get('error', 'Unknown error from LLM provider')
                    logger.warning(f"⚠️ Provider {try_provider} returned error: {last_error}")
                    continue  # Try next provider
                
                if not response.get('text'):
                    last_error = 'No response text received from LLM provider'
                    logger.warning(f"⚠️ Provider {try_provider} returned no text")
                    continue  # Try next provider
                
                # Success!
                request.response_text = response.get('text')
                if response.get('json'):
                    request.response_json = json.dumps(response['json'])
                request.status = 'completed'
                request.error_message = None
                
                logger.info(f"✅ Analysis {request_id} retry successful with provider {try_provider}")
                db.commit()
                return request
                
            except Exception as e:
                last_error = str(e)
                logger.warning(f"⚠️ Retry attempt {request.retry_count} with provider {try_provider} failed: {e}")
                continue  # Try next provider
        
        # All providers failed
        error_code = categorize_error(Exception(last_error or 'Unknown error'), str(last_error or 'Unknown error'))
        user_message, _ = get_error_message(error_code, 'he')
        
        request.status = 'failed'
        request.error_message = f"{error_code}: {user_message}"
        logger.error(f"❌ Retry attempt {request.retry_count} failed for analysis {request_id} with all providers [{error_code}]")
        db.commit()
        return request

