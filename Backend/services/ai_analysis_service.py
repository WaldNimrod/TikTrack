"""
AI Analysis Service
Main service for AI analysis system
"""

from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import logging
import json
from datetime import datetime

from models.ai_analysis import AIPromptTemplate, AIAnalysisRequest, UserLLMProvider
from services.llm_providers.llm_provider_manager import LLMProviderManager
from services.api_key_encryption_service import APIKeyEncryptionService

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
    def build_prompt(template: AIPromptTemplate, variables: Dict[str, Any]) -> str:
        """
        Build final prompt from template and variables
        
        Args:
            template: Template object
            variables: User-provided variables
            
        Returns:
            Final prompt text
        """
        prompt = template.prompt_text
        
        # Replace variables in prompt
        for key, value in variables.items():
            placeholder = f"[{key}]"
            if placeholder in prompt:
                prompt = prompt.replace(placeholder, str(value))
        
        return prompt


class AIAnalysisService:
    """Main service for AI analysis"""
    
    def __init__(self):
        self.provider_manager = LLMProviderManager()
        self.encryption_service = APIKeyEncryptionService()
    
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
            user_id: User ID
            provider: LLM provider ('gemini' or 'perplexity')
            
        Returns:
            AIAnalysisRequest object
            
        Raises:
            ValueError: If template not found or invalid
        """
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
            provider = user_provider.default_provider
        
        # Get API key
        api_key = None
        if provider == 'gemini':
            if not user_provider.gemini_api_key:
                raise ValueError("Gemini API key not configured")
            if user_provider.gemini_api_key_encrypted:
                api_key = self.encryption_service.decrypt_api_key(user_provider.gemini_api_key)
            else:
                api_key = user_provider.gemini_api_key
        elif provider == 'perplexity':
            if not user_provider.perplexity_api_key:
                raise ValueError("Perplexity API key not configured")
            if user_provider.perplexity_api_key_encrypted:
                api_key = self.encryption_service.decrypt_api_key(user_provider.perplexity_api_key)
            else:
                api_key = user_provider.perplexity_api_key
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
            
            # Update request
            request.response_text = response.get('text')
            if response.get('json'):
                request.response_json = json.dumps(response['json'])
            request.status = 'completed'
            
        except Exception as e:
            logger.error(f"Error generating analysis: {e}", exc_info=True)
            request.status = 'failed'
            request.error_message = str(e)
        
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
            user_id: User ID
            limit: Maximum number of results
            offset: Offset for pagination
            template_id: Filter by template ID
            provider: Filter by provider
            status: Filter by status
            
        Returns:
            Tuple of (list of requests, total count)
        """
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
        requests = query.order_by(
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
            user_id: User ID (for authorization)
            
        Returns:
            Request or None if not found or not authorized
        """
        return db.query(AIAnalysisRequest).filter(
            AIAnalysisRequest.id == request_id,
            AIAnalysisRequest.user_id == user_id
        ).first()
    
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
            user_id: User ID
            provider: Provider name ('gemini' or 'perplexity')
            api_key: API key (will be encrypted)
            validate: Whether to validate API key
            
        Returns:
            Dictionary with success status and validation result
        """
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
            user_provider.gemini_api_key = encrypted_key
            user_provider.gemini_api_key_encrypted = True
        elif provider == 'perplexity':
            user_provider.perplexity_api_key = encrypted_key
            user_provider.perplexity_api_key_encrypted = True
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
            user_id: User ID
            
        Returns:
            UserLLMProvider or None
        """
        return db.query(UserLLMProvider).filter(
            UserLLMProvider.user_id == user_id
        ).first()

