"""
AI Analysis API Routes
API endpoints for AI analysis system
"""

from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from config.database import get_db
from services.ai_analysis_service import AIAnalysisService, PromptTemplateService
from services.llm_providers.llm_provider_manager import LLMProviderManager
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

ai_analysis_bp = Blueprint('ai_analysis', __name__, url_prefix='/api/ai-analysis')

# Initialize services
ai_analysis_service = AIAnalysisService()
provider_manager = LLMProviderManager()


def get_current_user_id() -> int:
    """Get current user ID from session"""
    # TODO: Implement proper authentication
    # For now, return 1 as default
    return getattr(g, 'user_id', 1)


@ai_analysis_bp.route('/generate', methods=['POST'])
def generate_analysis():
    """Create new AI analysis"""
    db: Session = next(get_db())
    normalizer = None
    
    try:
        user_id = get_current_user_id()
        data = request.get_json() or {}
        
        template_id = data.get('template_id')
        variables = data.get('variables', {})
        provider = data.get('provider')
        
        # Validation
        if not template_id:
            return jsonify({
                'status': 'error',
                'message': 'template_id is required'
            }), 400
        
        if not isinstance(variables, dict):
            return jsonify({
                'status': 'error',
                'message': 'variables must be a dictionary'
            }), 400
        
        # Generate analysis
        request_obj = ai_analysis_service.generate_analysis(
            db=db,
            template_id=template_id,
            variables=variables,
            user_id=user_id,
            provider=provider
        )
        
        return jsonify({
            'status': 'success',
            'data': request_obj.to_dict()
        }), 200
        
    except ValueError as e:
        logger.warning(f"Invalid request: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Error generating analysis: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': 'Internal server error'
        }), 500
    finally:
        db.close()


@ai_analysis_bp.route('/templates', methods=['GET'])
def get_templates():
    """Get all prompt templates"""
    db: Session = next(get_db())
    
    try:
        active_only = request.args.get('active_only', 'true').lower() == 'true'
        templates = PromptTemplateService.get_all_templates(db, active_only=active_only)
        
        return jsonify({
            'status': 'success',
            'data': [template.to_dict() for template in templates]
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting templates: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': 'Internal server error'
        }), 500
    finally:
        db.close()


@ai_analysis_bp.route('/history', methods=['GET'])
def get_history():
    """Get analysis history"""
    db: Session = next(get_db())
    
    try:
        user_id = get_current_user_id()
        limit = request.args.get('limit', type=int, default=50)
        offset = request.args.get('offset', type=int, default=0)
        template_id = request.args.get('template_id', type=int)
        provider = request.args.get('provider')
        status = request.args.get('status')
        
        requests, total = ai_analysis_service.get_analysis_history(
            db=db,
            user_id=user_id,
            limit=limit,
            offset=offset,
            template_id=template_id,
            provider=provider,
            status=status
        )
        
        return jsonify({
            'status': 'success',
            'data': [req.to_dict() for req in requests],
            'extra': {
                'count': len(requests),
                'total': total
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting history: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': 'Internal server error'
        }), 500
    finally:
        db.close()


@ai_analysis_bp.route('/history/<int:request_id>', methods=['GET'])
def get_analysis_by_id(request_id: int):
    """Get specific analysis by ID"""
    db: Session = next(get_db())
    
    try:
        user_id = get_current_user_id()
        request_obj = ai_analysis_service.get_analysis_by_id(
            db=db,
            request_id=request_id,
            user_id=user_id
        )
        
        if not request_obj:
            return jsonify({
                'status': 'error',
                'message': 'Analysis not found'
            }), 404
        
        return jsonify({
            'status': 'success',
            'data': request_obj.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting analysis: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': 'Internal server error'
        }), 500
    finally:
        db.close()


@ai_analysis_bp.route('/llm-provider', methods=['GET', 'POST'])
def manage_llm_provider():
    """Get or update LLM provider settings"""
    db: Session = next(get_db())
    
    try:
        user_id = get_current_user_id()
        
        if request.method == 'GET':
            # Get settings
            settings = ai_analysis_service.get_llm_provider_settings(db=db, user_id=user_id)
            
            if not settings:
                return jsonify({
                    'status': 'success',
                    'data': {
                        'default_provider': 'gemini',
                        'providers_configured': [],
                        'gemini_configured': False,
                        'perplexity_configured': False
                    }
                }), 200
            
            return jsonify({
                'status': 'success',
                'data': settings.to_dict()
            }), 200
        
        else:  # POST
            # Update settings
            data = request.get_json() or {}
            provider = data.get('provider')
            api_key = data.get('api_key')
            validate = data.get('validate', True)
            
            if not provider:
                return jsonify({
                    'status': 'error',
                    'message': 'provider is required'
                }), 400
            
            if not api_key:
                return jsonify({
                    'status': 'error',
                    'message': 'api_key is required'
                }), 400
            
            result = ai_analysis_service.update_llm_provider_settings(
                db=db,
                user_id=user_id,
                provider=provider,
                api_key=api_key,
                validate=validate
            )
            
            if not result['success']:
                return jsonify({
                    'status': 'error',
                    'message': result['message']
                }), 400
            
            return jsonify({
                'status': 'success',
                'data': result
            }), 200
        
    except ValueError as e:
        logger.warning(f"Invalid request: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Error managing LLM provider: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': 'Internal server error'
        }), 500
    finally:
        db.close()

