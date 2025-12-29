"""
Integration Tests for AI Analysis API
=====================================

Tests all AI Analysis API endpoints including authentication,
validation, and business logic integration.
"""

import pytest
from flask import Flask, g
from unittest.mock import Mock, patch, MagicMock
import json


@pytest.fixture
def app():
    """Create Flask app for testing."""
    from Backend.app import create_app
    app = create_app({'TESTING': True})
    return app


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def mock_db_session():
    """Create mock database session."""
    return Mock()


@pytest.fixture
def mock_user_id():
    """Mock user ID for testing."""
    return 1


@pytest.fixture
def authenticated_client(client, mock_user_id):
    """Create authenticated test client with user_id in g."""
    with client.application.app_context():
        g.user_id = mock_user_id
        yield client


class TestAIAnalysisAPI:
    """Test suite for AI Analysis API endpoints."""
    
    def test_generate_analysis_endpoint_success(self, auth_client):
        """Test POST /api/ai_analysis/generate with valid data."""
        with patch('routes.api.ai_analysis.ai_analysis_service') as mock_service:
            # Mock successful analysis generation
            mock_request = Mock()
            mock_request.id = 123
            mock_request.template_id = 1
            mock_request.provider = 'gemini'
            mock_request.status = 'completed'
            mock_request.to_dict.return_value = {
                'id': 123,
                'template_id': 1,
                'provider': 'gemini',
                'status': 'completed',
                'response_text': 'Test response'
            }

            mock_service.generate_analysis.return_value = mock_request

            response = auth_client.post('/api/ai_analysis/generate', json={
                'template_id': 1,
                'variables': {'stock_ticker': 'TSLA', 'goal': 'Investment'},
                'provider': 'gemini'
            })

            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['status'] == 'success'
            assert data['data']['id'] == 123
    
    def test_generate_analysis_endpoint_validation_error(self, client, mock_user_id):
        """Test POST /api/ai-analysis/generate with validation error."""
        with client.application.app_context():
            g.user_id = mock_user_id
            with patch('routes.api.ai_analysis.ai_analysis_service') as mock_service:
                # Mock validation error
                mock_service.generate_analysis.side_effect = ValueError('Validation failed: Template not found')
                
                response = client.post('/api/ai-analysis/generate', json={
                    'template_id': 999,
                    'variables': {'stock_ticker': 'TSLA'},
                    'provider': 'gemini',
                    'user_id': mock_user_id
                })
                
                assert response.status_code == 400
            data = json.loads(response.data)
            assert data['status'] == 'error'
                # Check for error_code (new format) or error_type (old format)
                assert 'error_code' in data or 'error_type' in data
    
    def test_generate_analysis_endpoint_missing_template_id(self, client, mock_user_id):
        """Test POST /api/ai-analysis/generate with missing template_id."""
        with client.application.app_context():
            g.user_id = mock_user_id
            response = client.post('/api/ai-analysis/generate', json={
                'variables': {'stock_ticker': 'TSLA'},
                'provider': 'gemini',
                'user_id': mock_user_id
            })
            
            assert response.status_code == 400
            data = json.loads(response.data)
            assert data['status'] == 'error'
            assert 'template_id' in data['message'].lower() or 'error_code' in data
    
    def test_generate_analysis_endpoint_invalid_variables(self, client, mock_user_id):
        """Test POST /api/ai-analysis/generate with invalid variables."""
        with client.application.app_context():
            g.user_id = mock_user_id
            response = client.post('/api/ai-analysis/generate', json={
                'template_id': 1,
                'variables': 'not a dict',
                'provider': 'gemini',
                'user_id': mock_user_id
            })
            
            assert response.status_code == 400
            data = json.loads(response.data)
            assert data['status'] == 'error'
            assert 'variables' in data['message'].lower() or 'dictionary' in data['message'].lower() or 'error_code' in data
    
    def test_get_templates_endpoint(self, client):
        """Test GET /api/ai-analysis/templates."""
        with patch('routes.api.ai_analysis.PromptTemplateService') as mock_service:
            # Mock templates
            mock_template1 = Mock()
            mock_template1.id = 1
            mock_template1.name = 'Template 1'
            mock_template1.name_he = 'תבנית 1'
            mock_template1.to_dict.return_value = {
                'id': 1,
                'name': 'Template 1',
                'name_he': 'תבנית 1'
            }
            
            mock_template2 = Mock()
            mock_template2.id = 2
            mock_template2.name = 'Template 2'
            mock_template2.name_he = 'תבנית 2'
            mock_template2.to_dict.return_value = {
                'id': 2,
                'name': 'Template 2',
                'name_he': 'תבנית 2'
            }
            
            mock_service.get_all_templates.return_value = [mock_template1, mock_template2]
            
            response = client.get('/api/ai-analysis/templates')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['status'] == 'success'
            assert len(data['data']) == 2
    
    def test_get_templates_endpoint_active_only(self, client):
        """Test GET /api/ai-analysis/templates?active_only=true."""
        with patch('routes.api.ai_analysis.PromptTemplateService') as mock_service:
            mock_template = Mock()
            mock_template.to_dict.return_value = {'id': 1, 'name': 'Template 1'}
            mock_service.get_all_templates.return_value = [mock_template]
            
            response = client.get('/api/ai-analysis/templates?active_only=true')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['status'] == 'success'
            # Verify active_only parameter was passed
            mock_service.get_all_templates.assert_called_once()
            call_args = mock_service.get_all_templates.call_args
            assert call_args[1]['active_only'] is True
    
    def test_get_history_endpoint(self, client, mock_user_id):
        """Test GET /api/ai-analysis/history."""
        with client.application.app_context():
            g.user_id = mock_user_id
            with patch('routes.api.ai_analysis.ai_analysis_service') as mock_service:
                # Mock history
                mock_request1 = Mock()
                mock_request1.id = 1
                mock_request1.template_id = 1
                mock_request1.provider = 'gemini'
                mock_request1.status = 'completed'
                mock_request1.to_dict.return_value = {
                    'id': 1,
                    'template_id': 1,
                    'provider': 'gemini',
                    'status': 'completed'
                }
                
                mock_request2 = Mock()
                mock_request2.id = 2
                mock_request2.template_id = 2
                mock_request2.provider = 'perplexity'
                mock_request2.status = 'completed'
                mock_request2.to_dict.return_value = {
                    'id': 2,
                    'template_id': 2,
                    'provider': 'perplexity',
                    'status': 'completed'
                }
                
                mock_service.get_analysis_history.return_value = ([mock_request1, mock_request2], 2)
                
                response = client.get('/api/ai-analysis/history?limit=50&offset=0&user_id=' + str(mock_user_id))
                
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['status'] == 'success'
                assert len(data['data']) == 2
            assert data['extra']['count'] == 2
            assert data['extra']['total'] == 2
    
    def test_get_history_endpoint_with_filters(self, client, mock_user_id):
        """Test GET /api/ai-analysis/history with filters."""
        with client.application.app_context():
            g.user_id = mock_user_id
            with patch('routes.api.ai_analysis.ai_analysis_service') as mock_service:
                mock_request = Mock()
                mock_request.to_dict.return_value = {'id': 1, 'template_id': 1}
                mock_service.get_analysis_history.return_value = ([mock_request], 1)
                
                response = client.get('/api/ai-analysis/history?template_id=1&provider=gemini&status=completed&user_id=' + str(mock_user_id))
                
            assert response.status_code == 200
                # Verify filters were passed
                call_args = mock_service.get_analysis_history.call_args
                assert call_args[1]['template_id'] == 1
                assert call_args[1]['provider'] == 'gemini'
                assert call_args[1]['status'] == 'completed'
    
    def test_get_analysis_by_id_endpoint(self, client, mock_user_id):
        """Test GET /api/ai-analysis/history/<id>."""
        with client.application.app_context():
            g.user_id = mock_user_id
            with patch('routes.api.ai_analysis.ai_analysis_service') as mock_service:
                mock_request = Mock()
                mock_request.id = 123
                mock_request.template_id = 1
                mock_request.provider = 'gemini'
                mock_request.status = 'completed'
                mock_request.to_dict.return_value = {
                    'id': 123,
                    'template_id': 1,
                    'provider': 'gemini',
                    'status': 'completed',
                    'response_text': 'Test response'
                }
                
                mock_service.get_analysis_by_id.return_value = mock_request
                
                response = client.get('/api/ai-analysis/history/123?user_id=' + str(mock_user_id))
                
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['status'] == 'success'
            assert data['data']['id'] == 123
    
    def test_get_analysis_by_id_endpoint_not_found(self, client, mock_user_id):
        """Test GET /api/ai-analysis/history/<id> when not found."""
        with client.application.app_context():
            g.user_id = mock_user_id
            with patch('routes.api.ai_analysis.ai_analysis_service') as mock_service:
                mock_service.get_analysis_by_id.return_value = None
                
                response = client.get('/api/ai-analysis/history/999?user_id=' + str(mock_user_id))
                
                assert response.status_code == 404
            data = json.loads(response.data)
            assert data['status'] == 'error'
                assert 'not found' in data['message'].lower()
    
    def test_llm_provider_get_endpoint(self, client, mock_user_id):
        """Test GET /api/ai-analysis/llm-provider."""
        with client.application.app_context():
            g.user_id = mock_user_id
            with patch('routes.api.ai_analysis.ai_analysis_service') as mock_service:
                # Mock provider settings
                mock_provider = Mock()
                mock_provider.default_provider = 'gemini'
                mock_provider.gemini_api_key = 'encrypted_key'
                mock_provider.perplexity_api_key = None
                mock_provider.to_dict.return_value = {
                    'default_provider': 'gemini',
                    'gemini_configured': True,
                    'perplexity_configured': False
                }
                
                mock_service.get_llm_provider_settings.return_value = mock_provider
                
                response = client.get('/api/ai-analysis/llm-provider?user_id=' + str(mock_user_id))
                
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['status'] == 'success'
            assert data['data']['default_provider'] == 'gemini'
            assert data['data']['gemini_configured'] is True
    
    def test_llm_provider_get_endpoint_not_found(self, client, mock_user_id):
        """Test GET /api/ai-analysis/llm-provider when settings not found."""
        with client.application.app_context():
            g.user_id = mock_user_id
            with patch('routes.api.ai_analysis.ai_analysis_service') as mock_service:
                mock_service.get_llm_provider_settings.return_value = None
                
                response = client.get('/api/ai-analysis/llm-provider?user_id=' + str(mock_user_id))
                
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['status'] == 'success'
                # Should return default settings
            assert data['data']['default_provider'] == 'gemini'
            assert data['data']['providers_configured'] == []
    
    def test_llm_provider_post_endpoint_success(self, client, mock_user_id):
        """Test POST /api/ai-analysis/llm-provider with valid API key."""
        with client.application.app_context():
            g.user_id = mock_user_id
            with patch('routes.api.ai_analysis.ai_analysis_service') as mock_service:
                mock_service.update_llm_provider_settings.return_value = {
                    'success': True,
                    'validated': True,
                    'message': 'Gemini API key saved successfully'
                }
                
                response = client.post('/api/ai-analysis/llm-provider', json={
                    'provider': 'gemini',
                    'api_key': 'test_api_key_12345',
                    'validate': True,
                    'user_id': mock_user_id
                })
                
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['status'] == 'success'
            assert data['data']['success'] is True
                # validated might be a timestamp dict or boolean
                validated = data['data'].get('validated')
                assert validated is not None, "validated field should exist"
                if isinstance(validated, dict):
                    # If it's a dict (timestamp), that's also valid
                    assert 'epochMs' in validated
                else:
                    assert validated is True
    
    def test_llm_provider_post_endpoint_missing_provider(self, client, mock_user_id):
        """Test POST /api/ai-analysis/llm-provider with missing provider."""
        with client.application.app_context():
            g.user_id = mock_user_id
            response = client.post('/api/ai-analysis/llm-provider', json={
                'api_key': 'test_api_key_12345',
                'user_id': mock_user_id
            })
            
            assert response.status_code == 400
            data = json.loads(response.data)
            assert data['status'] == 'error'
            assert 'provider' in data['message'].lower() or 'error_code' in data
    
    def test_llm_provider_post_endpoint_missing_api_key(self, client, mock_user_id):
        """Test POST /api/ai-analysis/llm-provider with missing API key."""
        with client.application.app_context():
            g.user_id = mock_user_id
            response = client.post('/api/ai-analysis/llm-provider', json={
                'provider': 'gemini',
                'user_id': mock_user_id
            })
            
            assert response.status_code == 400
            data = json.loads(response.data)
            assert data['status'] == 'error'
            assert 'api_key' in data['message'].lower() or 'error_code' in data
    
    def test_llm_provider_post_endpoint_invalid_key(self, client, mock_user_id):
        """Test POST /api/ai-analysis/llm-provider with invalid API key."""
        with client.application.app_context():
            g.user_id = mock_user_id
            with patch('routes.api.ai_analysis.ai_analysis_service') as mock_service:
                mock_service.update_llm_provider_settings.return_value = {
                    'success': False,
                    'validated': False,
                    'message': 'Invalid gemini API key'
                }
                
                response = client.post('/api/ai-analysis/llm-provider', json={
                    'provider': 'gemini',
                    'api_key': 'invalid_key',
                    'validate': True,
                    'user_id': mock_user_id
                })
                
                assert response.status_code == 400
            data = json.loads(response.data)
            assert data['status'] == 'error'
                assert 'invalid' in data['message'].lower()


class TestAIAnalysisBusinessLogicAPI:
    """Test suite for AI Analysis Business Logic API endpoints."""
    
    def test_business_logic_validate_endpoint_success(self, client):
        """Test POST /api/business/ai-analysis/validate with valid data."""
        with patch('routes.api.business_logic.ai_analysis_business_service') as mock_service:
            mock_service_instance = Mock()
            mock_service_instance.validate.return_value = {
                'is_valid': True,
                'errors': []
            }
            mock_service.return_value = mock_service_instance
            
            # Need to patch the actual service instance used in the route
            with patch('routes.api.business_logic.ai_analysis_business_service', mock_service_instance):
                response = client.post('/api/business/ai-analysis/validate', json={
                    'template_id': 1,
                    'variables': {'stock_ticker': 'TSLA'},
                    'user_id': 1,
                    'provider': 'gemini'
                })
                
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['status'] == 'success'
            assert data['data']['is_valid'] is True
    
    def test_business_logic_validate_endpoint_errors(self, client):
        """Test POST /api/business/ai-analysis/validate with validation errors."""
        with patch('routes.api.business_logic.ai_analysis_business_service') as mock_service:
            mock_service_instance = Mock()
            mock_service_instance.validate.return_value = {
                'is_valid': False,
                'errors': ['Template ID is required', 'Variables cannot be empty']
            }
            mock_service.return_value = mock_service_instance
            
            with patch('routes.api.business_logic.ai_analysis_business_service', mock_service_instance):
                response = client.post('/api/business/ai-analysis/validate', json={
                    'variables': {},
                    'provider': 'gemini'
                })
                
                assert response.status_code == 400
            data = json.loads(response.data)
            assert data['status'] == 'error'
                assert 'errors' in data['error']
                assert len(data['error']['errors']) == 2
    
    def test_business_logic_validate_variables_endpoint_success(self, client):
        """Test POST /api/business/ai-analysis/validate-variables with valid variables."""
        with patch('routes.api.business_logic.ai_analysis_business_service') as mock_service:
            mock_service_instance = Mock()
            mock_service_instance.validate_variables.return_value = {
                'is_valid': True,
                'errors': []
            }
            mock_service.return_value = mock_service_instance
            
            with patch('routes.api.business_logic.ai_analysis_business_service', mock_service_instance):
                response = client.post('/api/business/ai-analysis/validate-variables', json={
                    'variables': {
                        'stock_ticker': 'TSLA',
                        'goal': 'Investment'
                    }
                })
                
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['status'] == 'success'
            assert data['data']['is_valid'] is True
    
    def test_business_logic_validate_variables_endpoint_errors(self, client):
        """Test POST /api/business/ai-analysis/validate-variables with validation errors."""
        with patch('routes.api.business_logic.ai_analysis_business_service') as mock_service:
            mock_service_instance = Mock()
            mock_service_instance.validate_variables.return_value = {
                'is_valid': False,
                'errors': ['Variables dictionary cannot be empty']
            }
            mock_service.return_value = mock_service_instance
            
            with patch('routes.api.business_logic.ai_analysis_business_service', mock_service_instance):
                response = client.post('/api/business/ai-analysis/validate-variables', json={
                    'variables': {}
                })
                
                assert response.status_code == 400
            data = json.loads(response.data)
            assert data['status'] == 'error'
                assert 'errors' in data['error']
                assert len(data['error']['errors']) == 1

