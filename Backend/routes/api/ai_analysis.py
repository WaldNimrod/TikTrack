"""
AI Analysis API Routes
API endpoints for AI analysis system
"""

from flask import Blueprint, jsonify, request, g, session
from sqlalchemy.orm import Session
from config.database import get_db
from services.ai_analysis_service import AIAnalysisService, PromptTemplateService
from services.llm_providers.llm_provider_manager import LLMProviderManager
from routes.api.base_entity_utils import BaseEntityUtils
from services.date_normalization_service import DateNormalizationService
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

ai_analysis_bp = Blueprint('ai_analysis', __name__, url_prefix='/api/ai-analysis')

# Initialize services
ai_analysis_service = AIAnalysisService()
provider_manager = LLMProviderManager()


def get_current_user_id() -> int:
    """Get current user ID from session"""
    # Try session first
    user_id = session.get('user_id')
    if user_id:
        logger.debug(f"get_current_user_id: Found user_id={user_id} in session")
        return user_id
    
    # Try g.user_id
    user_id = getattr(g, 'user_id', None)
    if user_id:
        logger.debug(f"get_current_user_id: Found user_id={user_id} in g")
        return user_id
    
    # Fallback to default user (development mode)
    user_id = 1
    logger.debug(f"get_current_user_id: No user_id in session or g, using default user_id={user_id}")
    return user_id


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
            'data': request_obj.to_dict(include_response=True)  # Include response_text for initial response (to save to cache)
        }), 200
        
    except ValueError as e:
        logger.warning(f"Invalid request: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'error_type': 'validation_error'
        }), 400
    except Exception as e:
        logger.error(f"Error generating analysis: {e}", exc_info=True)
        # In development, include error details
        error_message = 'Internal server error'
        error_type = 'internal_error'
        if hasattr(e, '__class__'):
            error_type = e.__class__.__name__
        # In development mode, include more details
        import os
        if os.getenv('FLASK_ENV') == 'development':
            error_message = str(e)
        
        return jsonify({
            'status': 'error',
            'message': error_message,
            'error_type': error_type
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
    normalizer = None
    
    try:
        user_id = get_current_user_id()
        normalizer = BaseEntityUtils.get_request_normalizer(request, fallback_user_id=user_id)
        
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
        
        # Normalize dates in response
        data = [req.to_dict() for req in requests]
        normalized_data = BaseEntityUtils.normalize_output(normalizer, data) if normalizer else data
        
        return jsonify({
            'status': 'success',
            'data': normalized_data,
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
    normalizer = None
    
    try:
        user_id = get_current_user_id()
        normalizer = BaseEntityUtils.get_request_normalizer(request, fallback_user_id=user_id)
        
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
        
        # Normalize dates in response
        data = request_obj.to_dict(include_response=True)  # Include response_text for viewing (will be loaded from cache)
        normalized_data = BaseEntityUtils.normalize_output(normalizer, data) if normalizer else data
        
        return jsonify({
            'status': 'success',
            'data': normalized_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting analysis: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': 'Internal server error'
        }), 500
    finally:
        db.close()


@ai_analysis_bp.route('/history/<int:request_id>/availability', methods=['GET'])
def check_analysis_availability(request_id: int):
    """Check availability of analysis response (cache and notes)"""
    db: Session = next(get_db())
    normalizer = None
    
    try:
        user_id = get_current_user_id()
        normalizer = BaseEntityUtils.get_request_normalizer(request, fallback_user_id=user_id)
        
        # Get analysis
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
        
        # Check for note (search by content containing analysis ID or created_at timestamp)
        from models.note import Note
        from sqlalchemy import or_, func
        
        # Try to find note that might contain this analysis
        # We'll search for notes created around the same time as the analysis
        # and check if content might match (heuristic approach)
        analysis_created_at = request_obj.created_at
        notes = db.query(Note).filter(
            Note.user_id == user_id,
            func.abs(func.extract('epoch', Note.created_at - analysis_created_at)) < 300  # Within 5 minutes
        ).all()
        
        note_id = None
        note_exists = False
        
        # Check if any note might be related to this analysis
        # We'll use a simple heuristic: check if note was created close to analysis time
        # and if it contains markdown (typical for AI analysis notes)
        for note in notes:
            if note.content and ('##' in note.content or '**' in note.content or '###' in note.content):
                # Likely an AI analysis note (contains markdown)
                note_id = note.id
                note_exists = True
                break
        
        # If we found a note, verify it still exists
        if note_id:
            verified_note = db.query(Note).filter(Note.id == note_id).first()
            if not verified_note:
                note_exists = False
                note_id = None
        
        result = {
            'analysis_id': request_id,
            'has_cache': False,  # Frontend will check cache
            'has_note': note_exists,
            'note_id': note_id if note_exists else None
        }
        
        return jsonify({
            'status': 'success',
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"Error checking analysis availability: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': 'Internal server error'
        }), 500
    finally:
        db.close()


@ai_analysis_bp.route('/history/availability/batch', methods=['POST'])
def check_analysis_availability_batch():
    """Check availability for multiple analyses (cache and notes)"""
    db: Session = next(get_db())
    normalizer = None
    
    try:
        user_id = get_current_user_id()
        normalizer = BaseEntityUtils.get_request_normalizer(request, fallback_user_id=user_id)
        
        data = request.get_json() or {}
        analysis_ids = data.get('analysis_ids', [])
        
        if not analysis_ids or not isinstance(analysis_ids, list):
            return jsonify({
                'status': 'error',
                'message': 'analysis_ids array is required'
            }), 400
        
        # Get all analyses
        from models.ai_analysis import AIAnalysisRequest
        from models.note import Note
        from sqlalchemy import or_, func, and_
        
        analyses = db.query(AIAnalysisRequest).filter(
            AIAnalysisRequest.id.in_(analysis_ids),
            AIAnalysisRequest.user_id == user_id
        ).all()
        
        # Get all notes created around the same time as analyses
        if analyses:
            analysis_times = [a.created_at for a in analyses]
            min_time = min(analysis_times)
            max_time = max(analysis_times)
            
            # Expand time window by 5 minutes on each side
            from datetime import timedelta
            min_time = min_time - timedelta(minutes=5)
            max_time = max_time + timedelta(minutes=5)
            
            notes = db.query(Note).filter(
                Note.user_id == user_id,
                Note.created_at >= min_time,
                Note.created_at <= max_time
            ).all()
        else:
            notes = []
        
        # Build result map
        result_map = {}
        
        for analysis in analyses:
            note_id = None
            note_exists = False
            
            # Find matching note (heuristic: created within 5 minutes and contains markdown)
            for note in notes:
                time_diff = abs((note.created_at - analysis.created_at).total_seconds())
                if time_diff < 300 and note.content and ('##' in note.content or '**' in note.content or '###' in note.content):
                    note_id = note.id
                    note_exists = True
                    break
            
            # Verify note still exists
            if note_id:
                verified_note = db.query(Note).filter(Note.id == note_id).first()
                if not verified_note:
                    note_exists = False
                    note_id = None
            
            result_map[analysis.id] = {
                'analysis_id': analysis.id,
                'has_cache': False,  # Frontend will check cache
                'has_note': note_exists,
                'note_id': note_id if note_exists else None
            }
        
        return jsonify({
            'status': 'success',
            'data': result_map
        }), 200
        
    except Exception as e:
        logger.error(f"Error checking analysis availability batch: {e}", exc_info=True)
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
            logger.debug(f"Getting LLM provider settings for user_id={user_id}")
            settings = ai_analysis_service.get_llm_provider_settings(db=db, user_id=user_id)
            
            if not settings:
                logger.warning(f"No LLM provider settings found for user_id={user_id}, returning default")
                return jsonify({
                    'status': 'success',
                    'data': {
                        'default_provider': 'gemini',
                        'providers_configured': [],
                        'gemini_configured': False,
                        'perplexity_configured': False
                    }
                }), 200
            
            logger.debug(f"Found LLM provider settings for user_id={user_id}, gemini_configured={bool(settings.gemini_api_key)}")
            result = settings.to_dict()
            logger.debug(f"to_dict() result: gemini_configured={result.get('gemini_configured')}, keys={list(result.keys())}")
            return jsonify({
                'status': 'success',
                'data': result
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

