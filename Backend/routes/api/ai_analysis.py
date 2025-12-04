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
from routes.api.base_entity_decorators import require_authentication
from services.date_normalization_service import DateNormalizationService
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

ai_analysis_bp = Blueprint('ai_analysis', __name__, url_prefix='/api/ai-analysis')

# Initialize services
ai_analysis_service = AIAnalysisService()
provider_manager = LLMProviderManager()


@ai_analysis_bp.route('/generate', methods=['POST'])
@require_authentication()
def generate_analysis():
    """Create new AI analysis"""
    db: Session = next(get_db())
    normalizer = None
    
    try:
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            logger.error("❌ User ID not found in Flask context - user not authenticated")
            return jsonify({
                'status': 'error',
                'message': 'User authentication required'
            }), 401
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
@require_authentication()
def get_history():
    """Get analysis history"""
    db: Session = next(get_db())
    normalizer = None
    
    try:
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            logger.error("❌ User ID not found in Flask context - user not authenticated")
            return jsonify({
                'status': 'error',
                'message': 'User authentication required'
            }), 401
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
@require_authentication()
def get_analysis_by_id(request_id: int):
    """Get specific analysis by ID"""
    db: Session = next(get_db())
    normalizer = None
    
    try:
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            logger.error("❌ User ID not found in Flask context - user not authenticated")
            return jsonify({
                'status': 'error',
                'message': 'User authentication required'
            }), 401
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
@require_authentication()
def check_analysis_availability(request_id: int):
    """Check availability of analysis response (cache and notes)"""
    db: Session = next(get_db())
    normalizer = None
    
    try:
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            logger.error("❌ User ID not found in Flask context - user not authenticated")
            return jsonify({
                'status': 'error',
                'message': 'User authentication required'
            }), 401
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
@require_authentication()
def check_analysis_availability_batch():
    """Check availability for multiple analyses (cache and notes)"""
    db: Session = next(get_db())
    
    try:
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            logger.error("❌ User ID not found in Flask context - user not authenticated")
            return jsonify({
                'status': 'error',
                'message': 'User authentication required'
            }), 401
        logger.debug(f"Checking availability batch for user_id={user_id}")
        
        data = request.get_json() or {}
        analysis_ids = data.get('analysis_ids', [])
        logger.debug(f"Received analysis_ids: {analysis_ids}")
        
        if not analysis_ids or not isinstance(analysis_ids, list):
            logger.warning(f"Invalid analysis_ids in batch request: {analysis_ids}")
            return jsonify({
                'status': 'error',
                'message': 'analysis_ids array is required'
            }), 400
        
        # Convert to integers if needed
        try:
            analysis_ids = [int(id) for id in analysis_ids if id is not None]
        except (ValueError, TypeError) as e:
            logger.warning(f"Error converting analysis_ids to integers: {e}")
            return jsonify({
                'status': 'error',
                'message': 'Invalid analysis_ids format'
            }), 400
        
        if not analysis_ids:
            # Return empty result map if no valid IDs
            return jsonify({
                'status': 'success',
                'data': {}
            }), 200
        
        # Get all analyses
        from models.ai_analysis import AIAnalysisRequest
        from models.note import Note
        from datetime import timedelta
        
        analyses = db.query(AIAnalysisRequest).filter(
            AIAnalysisRequest.id.in_(analysis_ids),
            AIAnalysisRequest.user_id == user_id
        ).all()
        
        # Get all notes created around the same time as analyses
        notes = []
        if analyses:
            try:
                analysis_times = [a.created_at for a in analyses if a.created_at]
                if analysis_times:
                    min_time = min(analysis_times)
                    max_time = max(analysis_times)
                    
                    # Expand time window by 30 minutes on each side (to catch notes saved later)
                    min_time = min_time - timedelta(minutes=30)
                    max_time = max_time + timedelta(minutes=30)
                    
                    notes = db.query(Note).filter(
                        Note.user_id == user_id,
                        Note.created_at >= min_time,
                        Note.created_at <= max_time
                    ).all()
            except Exception as e:
                logger.warning(f"Error querying notes: {e}")
                notes = []
        
        # Build result map
        result_map = {}
        
        for analysis in analyses:
            note_id = None
            note_exists = False
            
            # Find matching note using improved heuristics:
            # 1. Created within 30 minutes of analysis
            # 2. Contains markdown (typical for AI analysis notes)
            # 3. Contains analysis ID in content (e.g., "AI Analysis #123" or "ניתוח AI #123")
            if analysis.created_at:
                analysis_id_str = str(analysis.id)
                logger.debug(f"Checking notes for analysis_id={analysis.id}, created_at={analysis.created_at}")
                
                for note in notes:
                    try:
                        time_diff = abs((note.created_at - analysis.created_at).total_seconds())
                        
                        # Check if note was created within 30 minutes (1800 seconds)
                        if time_diff < 1800 and note.content:
                            # Check if note contains markdown (typical for AI analysis notes)
                            has_markdown = ('##' in note.content or '**' in note.content or '###' in note.content)
                            
                            # Check if note content contains analysis ID
                            # Look for patterns like "AI Analysis #123", "ניתוח AI #123", or just "#123"
                            contains_id = (
                                f"#{analysis_id_str}" in note.content or
                                f"AI Analysis #{analysis_id_str}" in note.content or
                                f"ניתוח AI #{analysis_id_str}" in note.content or
                                f"analysis #{analysis_id_str}" in note.content.lower() or
                                f"ניתוח #{analysis_id_str}" in note.content
                            )
                            
                            # Match if: (has markdown) OR (contains ID) OR (both)
                            if has_markdown or contains_id:
                                logger.debug(f"Found matching note: note_id={note.id}, time_diff={time_diff:.0f}s, "
                                           f"has_markdown={has_markdown}, contains_id={contains_id}")
                                note_id = note.id
                                note_exists = True
                                break
                    except Exception as e:
                        logger.warning(f"Error comparing note time for analysis_id={analysis.id}, note_id={note.id}: {e}")
                        continue
                
                if not note_exists:
                    logger.debug(f"No matching note found for analysis_id={analysis.id}")
            
            # Verify note still exists
            if note_id:
                try:
                    verified_note = db.query(Note).filter(Note.id == note_id).first()
                    if not verified_note:
                        logger.warning(f"Note {note_id} was found but no longer exists")
                        note_exists = False
                        note_id = None
                    else:
                        logger.debug(f"Verified note {note_id} exists for analysis_id={analysis.id}")
                except Exception as e:
                    logger.warning(f"Error verifying note {note_id}: {e}")
                    note_exists = False
                    note_id = None
            
            result_map[analysis.id] = {
                'analysis_id': analysis.id,
                'has_cache': False,  # Frontend will check cache
                'has_note': note_exists,
                'note_id': note_id if note_exists else None
            }
        
        # Also add entries for IDs that weren't found (to avoid frontend errors)
        for analysis_id in analysis_ids:
            if analysis_id not in result_map:
                result_map[analysis_id] = {
                    'analysis_id': analysis_id,
                    'has_cache': False,
                    'has_note': False,
                    'note_id': None
                }
        
        # Log summary statistics
        notes_found = sum(1 for r in result_map.values() if r.get('has_note', False))
        logger.debug(f"Returning availability batch result: {len(result_map)} items, {notes_found} with notes")
        return jsonify({
            'status': 'success',
            'data': result_map
        }), 200
        
    except Exception as e:
        logger.error(f"Error checking analysis availability batch: {e}", exc_info=True)
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'status': 'error',
            'message': f'Internal server error: {str(e)}',
            'error_type': type(e).__name__
        }), 500
    finally:
        db.close()


@ai_analysis_bp.route('/delete-all', methods=['DELETE'])
@require_authentication()
def delete_all_analyses():
    """Delete all AI analysis records - Admin/dev utility"""
    db: Session = next(get_db())
    
    try:
        from models.ai_analysis import AIAnalysisRequest
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            logger.error("❌ User ID not found in Flask context - user not authenticated")
            return jsonify({
                "status": "error",
                "error": {"message": "User authentication required"},
                "version": "1.0"
            }), 401
        
        logger.info("=== DELETE ALL AI ANALYSES START ===")
        logger.info(f"Deleting all analyses for user_id={user_id}")
        
        # Count existing records
        count = db.query(AIAnalysisRequest).filter(
            AIAnalysisRequest.user_id == user_id
        ).count()
        logger.info(f"Found {count} analyses to delete")
        
        if count == 0:
            logger.info("No analyses to delete")
            db.close()
            return jsonify({
                "status": "success",
                "message": "No analyses to delete - table is already empty",
                "deleted_count": 0,
                "version": "1.0"
            }), 200
        
        # Delete all records for this user
        # Use synchronize_session=False for bulk delete
        deleted_count = db.query(AIAnalysisRequest).filter(
            AIAnalysisRequest.user_id == user_id
        ).delete(synchronize_session=False)
        
        # Commit the deletion
        db.commit()
        
        logger.info(f"Committed deletion of {deleted_count} analyses")
        
        logger.info(f"Successfully deleted {deleted_count} analyses")
        
        return jsonify({
            "status": "success",
            "message": f"Successfully deleted {deleted_count} analyses",
            "deleted_count": deleted_count,
            "version": "1.0"
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting all analyses: {str(e)}", exc_info=True)
        db.rollback()
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to delete all analyses: {str(e)}"},
            "version": "1.0"
        }), 500
    finally:
        db.close()


@ai_analysis_bp.route('/llm-provider', methods=['GET', 'POST'])
@require_authentication()
def manage_llm_provider():
    """Get or update LLM provider settings"""
    db: Session = next(get_db())
    
    try:
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            logger.error("❌ User ID not found in Flask context - user not authenticated")
            return jsonify({
                'status': 'error',
                'message': 'User authentication required'
            }), 401
        
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

