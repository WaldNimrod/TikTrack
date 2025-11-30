"""
Tests for AI Analysis Service
==============================

Tests for the main AI Analysis Service including analysis generation,
history retrieval, and LLM provider settings management.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from services.ai_analysis_service import AIAnalysisService, PromptTemplateService
from models.ai_analysis import AIPromptTemplate, AIAnalysisRequest, UserLLMProvider


class TestPromptTemplateService:
    """Test suite for PromptTemplateService."""
    
    def test_build_prompt_basic(self):
        """Test basic prompt building."""
        template = Mock(spec=AIPromptTemplate)
        template.prompt_text = "Analyze {stock_ticker} for {goal}"
        
        variables = {
            'stock_ticker': 'TSLA',
            'goal': 'Investment'
        }
        
        result = PromptTemplateService.build_prompt(template, variables)
        
        assert 'TSLA' in result
        assert 'Investment' in result
        assert '{stock_ticker}' not in result
        assert '{goal}' not in result
    
    def test_build_prompt_hebrew(self):
        """Test prompt building with Hebrew response language."""
        template = Mock(spec=AIPromptTemplate)
        template.prompt_text = "Analyze {stock_ticker}"
        
        variables = {
            'stock_ticker': 'TSLA',
            'response_language': 'hebrew'
        }
        
        result = PromptTemplateService.build_prompt(template, variables)
        
        # Should contain Hebrew instructions
        assert 'עברית' in result or 'אסור' in result or '🚫' in result
    
    def test_build_prompt_english(self):
        """Test prompt building with English response language."""
        template = Mock(spec=AIPromptTemplate)
        template.prompt_text = "Analyze {stock_ticker}"
        
        variables = {
            'stock_ticker': 'TSLA',
            'response_language': 'english'
        }
        
        result = PromptTemplateService.build_prompt(template, variables)
        
        # Should contain English instruction
        assert 'IMPORTANT' in result or 'English' in result


class TestAIAnalysisService:
    """Test suite for AIAnalysisService."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.service = AIAnalysisService()
        self.mock_db = Mock()
    
    def test_init(self):
        """Test service initialization."""
        service = AIAnalysisService()
        
        assert service.provider_manager is not None
        assert service.encryption_service is not None
        assert service.business_service is not None
    
    @patch('services.ai_analysis_service.PromptTemplateService.get_template')
    @patch('services.ai_analysis_service.LLMProviderManager')
    def test_generate_analysis_validation_failure(self, mock_provider_manager, mock_get_template):
        """Test generate_analysis with validation failure."""
        # Mock business service to return validation failure
        self.service.business_service = Mock()
        self.service.business_service.validate.return_value = {
            'is_valid': False,
            'errors': ['Template not found', 'Invalid variables']
        }
        
        with pytest.raises(ValueError, match='Validation failed'):
            self.service.generate_analysis(
                db=self.mock_db,
                template_id=999,
                variables={},
                user_id=1,
                provider='gemini'
            )
    
    @patch('services.ai_analysis_service.PromptTemplateService.get_template')
    @patch('services.ai_analysis_service.LLMProviderManager')
    def test_generate_analysis_template_not_found(self, mock_provider_manager, mock_get_template):
        """Test generate_analysis with template not found."""
        # Mock business service to pass validation
        self.service.business_service = Mock()
        self.service.business_service.validate.return_value = {
            'is_valid': True,
            'errors': []
        }
        
        # Mock get_template to return None
        mock_get_template.return_value = None
        
        with pytest.raises(ValueError, match='Template.*not found'):
            self.service.generate_analysis(
                db=self.mock_db,
                template_id=999,
                variables={'stock_ticker': 'TSLA'},
                user_id=1,
                provider='gemini'
            )
    
    @patch('services.ai_analysis_service.PromptTemplateService.get_template')
    @patch('services.ai_analysis_service.LLMProviderManager')
    def test_generate_analysis_missing_user_provider(self, mock_provider_manager, mock_get_template):
        """Test generate_analysis with missing user provider settings."""
        # Mock business service to pass validation
        self.service.business_service = Mock()
        self.service.business_service.validate.return_value = {
            'is_valid': True,
            'errors': []
        }
        
        # Mock template
        mock_template = Mock(spec=AIPromptTemplate)
        mock_template.prompt_text = "Analyze {stock_ticker}"
        mock_get_template.return_value = mock_template
        
        # Mock DB query to return None (no user provider)
        self.mock_db.query.return_value.filter.return_value.first.return_value = None
        
        with pytest.raises(ValueError, match='User LLM provider settings not found'):
            self.service.generate_analysis(
                db=self.mock_db,
                template_id=1,
                variables={'stock_ticker': 'TSLA'},
                user_id=1,
                provider='gemini'
            )
    
    @patch('services.ai_analysis_service.PromptTemplateService.get_template')
    @patch('services.ai_analysis_service.LLMProviderManager')
    def test_generate_analysis_missing_api_key(self, mock_provider_manager, mock_get_template):
        """Test generate_analysis with missing API key."""
        # Mock business service to pass validation
        self.service.business_service = Mock()
        self.service.business_service.validate.return_value = {
            'is_valid': True,
            'errors': []
        }
        
        # Mock template
        mock_template = Mock(spec=AIPromptTemplate)
        mock_template.prompt_text = "Analyze {stock_ticker}"
        mock_get_template.return_value = mock_template
        
        # Mock user provider with empty API key
        mock_user_provider = Mock(spec=UserLLMProvider)
        mock_user_provider.gemini_api_key = None
        mock_user_provider.gemini_api_key_encrypted = False
        self.mock_db.query.return_value.filter.return_value.first.return_value = mock_user_provider
        
        with pytest.raises(ValueError, match='Gemini API key not configured'):
            self.service.generate_analysis(
                db=self.mock_db,
                template_id=1,
                variables={'stock_ticker': 'TSLA'},
                user_id=1,
                provider='gemini'
            )
    
    def test_get_analysis_history(self):
        """Test getting analysis history."""
        # Mock DB query
        mock_request = Mock(spec=AIAnalysisRequest)
        mock_request.id = 1
        mock_request.template_id = 1
        mock_request.provider = 'gemini'
        mock_request.status = 'completed'
        
        self.mock_db.query.return_value.filter.return_value.options.return_value.order_by.return_value.offset.return_value.limit.return_value.all.return_value = [mock_request]
        self.mock_db.query.return_value.filter.return_value.count.return_value = 1
        
        requests, total = self.service.get_analysis_history(
            db=self.mock_db,
            user_id=1,
            limit=50,
            offset=0
        )
        
        assert isinstance(requests, list)
        assert total == 1
    
    def test_get_analysis_by_id(self):
        """Test getting analysis by ID."""
        # Mock DB query
        mock_request = Mock(spec=AIAnalysisRequest)
        mock_request.id = 1
        mock_request.user_id = 1
        
        self.mock_db.query.return_value.options.return_value.filter.return_value.first.return_value = mock_request
        
        result = self.service.get_analysis_by_id(
            db=self.mock_db,
            request_id=1,
            user_id=1
        )
        
        assert result is not None
        assert result.id == 1
    
    def test_get_analysis_by_id_not_found(self):
        """Test getting analysis by ID when not found."""
        # Mock DB query to return None
        self.mock_db.query.return_value.options.return_value.filter.return_value.first.return_value = None
        
        result = self.service.get_analysis_by_id(
            db=self.mock_db,
            request_id=999,
            user_id=1
        )
        
        assert result is None
    
    def test_get_analysis_by_id_unauthorized(self):
        """Test getting analysis by ID with wrong user (authorization check)."""
        # Mock DB query to return None (user 2 trying to access user 1's analysis)
        self.mock_db.query.return_value.options.return_value.filter.return_value.first.return_value = None
        
        result = self.service.get_analysis_by_id(
            db=self.mock_db,
            request_id=1,
            user_id=2  # Different user
        )
        
        assert result is None
    
    @patch('services.ai_analysis_service.LLMProviderManager')
    def test_update_llm_provider_settings_success(self, mock_provider_manager):
        """Test updating LLM provider settings successfully."""
        # Mock provider manager validation
        mock_provider_manager_instance = Mock()
        mock_provider_manager_instance.validate_api_key.return_value = True
        mock_provider_manager.return_value = mock_provider_manager_instance
        self.service.provider_manager = mock_provider_manager_instance
        
        # Mock user provider (existing)
        mock_user_provider = Mock(spec=UserLLMProvider)
        mock_user_provider.user_id = 1
        self.mock_db.query.return_value.filter.return_value.first.return_value = mock_user_provider
        
        # Mock encryption service method
        with patch.object(self.service.encryption_service, 'encrypt_api_key', return_value='encrypted_key'):
            result = self.service.update_llm_provider_settings(
                db=self.mock_db,
                user_id=1,
                provider='gemini',
                api_key='test_key',
                validate=True
            )
            
            assert result['success'] is True
            assert result['validated'] is True
    
    @patch('services.ai_analysis_service.LLMProviderManager')
    def test_update_llm_provider_settings_invalid_key(self, mock_provider_manager):
        """Test updating LLM provider settings with invalid API key."""
        # Mock provider manager validation to fail
        mock_provider_manager_instance = Mock()
        mock_provider_manager_instance.validate_api_key.return_value = False
        mock_provider_manager.return_value = mock_provider_manager_instance
        self.service.provider_manager = mock_provider_manager_instance
        
        result = self.service.update_llm_provider_settings(
            db=self.mock_db,
            user_id=1,
            provider='gemini',
            api_key='invalid_key',
            validate=True
        )
        
        assert result['success'] is False
        assert result['validated'] is False
        assert 'Invalid' in result['message'] or 'invalid' in result['message'].lower()
    
    def test_get_llm_provider_settings(self):
        """Test getting LLM provider settings."""
        # Mock user provider
        mock_user_provider = Mock(spec=UserLLMProvider)
        mock_user_provider.user_id = 1
        mock_user_provider.default_provider = 'gemini'
        
        self.mock_db.query.return_value.filter.return_value.first.return_value = mock_user_provider
        
        result = self.service.get_llm_provider_settings(
            db=self.mock_db,
            user_id=1
        )
        
        assert result is not None
        assert result.user_id == 1
    
    def test_get_llm_provider_settings_not_found(self):
        """Test getting LLM provider settings when not found."""
        # Mock DB query to return None
        self.mock_db.query.return_value.filter.return_value.first.return_value = None
        
        result = self.service.get_llm_provider_settings(
            db=self.mock_db,
            user_id=1
        )
        
        assert result is None

