"""
AI Analysis Models
Models for AI analysis system with LLM integration
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel
from typing import Dict, Any, Optional
import json

class AIPromptTemplate(BaseModel):
    """תבניות פרומפטים לניתוח AI"""
    __tablename__ = "ai_prompt_templates"
    
    name = Column(String(100), nullable=False, unique=True, comment="Template name in English")
    name_he = Column(String(100), nullable=False, comment="Template name in Hebrew")
    description = Column(Text, nullable=True, comment="Template description")
    prompt_text = Column(Text, nullable=False, comment="Full prompt template text")
    variables_json = Column(Text, nullable=False, comment="JSON string of variable definitions")
    is_active = Column(Boolean, default=True, nullable=False, comment="Whether template is active")
    sort_order = Column(Integer, default=0, nullable=False, comment="Display order")
    
    # Relationships
    analysis_requests = relationship("AIAnalysisRequest", back_populates="template")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        result = super().to_dict()
        try:
            result['variables_json'] = json.loads(self.variables_json) if self.variables_json else {}
        except (json.JSONDecodeError, TypeError):
            result['variables_json'] = {}
        return result
    
    def __repr__(self) -> str:
        return f"<AIPromptTemplate(id={self.id}, name='{self.name}', is_active={self.is_active})>"


class AIAnalysisRequest(BaseModel):
    """בקשות ניתוח AI (history)"""
    __tablename__ = "ai_analysis_requests"
    
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True,
                    comment="User who created this analysis")
    template_id = Column(Integer, ForeignKey('ai_prompt_templates.id'), nullable=False,
                        comment="Template used for this analysis")
    provider = Column(String(50), nullable=False, comment="LLM provider: 'gemini' or 'perplexity'")
    variables_json = Column(Text, nullable=False, comment="User-provided variables as JSON")
    prompt_text = Column(Text, nullable=False, comment="Final prompt sent to LLM")
    response_text = Column(Text, nullable=True, comment="LLM response text")
    response_json = Column(Text, nullable=True, comment="Parsed JSON response if applicable")
    status = Column(String(20), default='pending', nullable=False,
                   comment="Request status: 'pending', 'completed', 'failed'")
    error_message = Column(Text, nullable=True, comment="Error message if status is 'failed'")
    
    # Timestamps
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    template = relationship("AIPromptTemplate", back_populates="analysis_requests")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        result = super().to_dict()
        try:
            result['variables_json'] = json.loads(self.variables_json) if self.variables_json else {}
        except (json.JSONDecodeError, TypeError):
            result['variables_json'] = {}
        try:
            result['response_json'] = json.loads(self.response_json) if self.response_json else None
        except (json.JSONDecodeError, TypeError):
            result['response_json'] = None
        return result
    
    def __repr__(self) -> str:
        return f"<AIAnalysisRequest(id={self.id}, user_id={self.user_id}, template_id={self.template_id}, status='{self.status}')>"


class UserLLMProvider(BaseModel):
    """הגדרות מנוע LLM למשתמש"""
    __tablename__ = "user_llm_providers"
    
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, unique=True, index=True,
                    comment="User ID (unique - one record per user)")
    default_provider = Column(String(50), default='gemini', nullable=False,
                             comment="Default LLM provider: 'gemini' or 'perplexity'")
    gemini_api_key = Column(String(500), nullable=True, comment="Encrypted Gemini API key")
    perplexity_api_key = Column(String(500), nullable=True, comment="Encrypted Perplexity API key")
    gemini_api_key_encrypted = Column(Boolean, default=True, nullable=False,
                                      comment="Whether Gemini API key is encrypted")
    perplexity_api_key_encrypted = Column(Boolean, default=True, nullable=False,
                                         comment="Whether Perplexity API key is encrypted")
    
    # Timestamps
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary (API keys are never returned)"""
        result = super().to_dict()
        # Remove API keys from response for security
        result.pop('gemini_api_key', None)
        result.pop('perplexity_api_key', None)
        result['gemini_configured'] = bool(self.gemini_api_key)
        result['perplexity_configured'] = bool(self.perplexity_api_key)
        return result
    
    def __repr__(self) -> str:
        return f"<UserLLMProvider(user_id={self.user_id}, default_provider='{self.default_provider}')>"

