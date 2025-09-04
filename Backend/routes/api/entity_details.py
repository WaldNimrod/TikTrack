"""
API Routes for Entity Details Management - TikTrack
=================================================

This module contains API endpoints for the unified entity details system.
Provides access to detailed information for any entity type in the system.

Endpoints:
    GET /api/entity-details/<entity_type>/<entity_id> - Get entity details
    GET /api/entity-details/<entity_type>/<entity_id>/linked-items - Get linked items only
    GET /api/entity-details/<entity_type>/<entity_id>/full - Get entity with linked items
    GET /api/entity-details/types - Get supported entity types

Author: Nimrod
Version: 1.0.0
Date: September 4, 2025
"""

from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from services.entity_details_service import EntityDetailsService
from services.advanced_cache_service import cache_for, invalidate_cache
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

entity_details_bp = Blueprint('entity_details', __name__, url_prefix='/api/entity-details')

@entity_details_bp.route('/types', methods=['GET'])
@cache_for(ttl=3600)  # Cache for 1 hour - rarely changes
def get_supported_entity_types():
    """Get list of supported entity types"""
    try:
        entity_types = EntityDetailsService.get_supported_entity_types()
        return jsonify({
            "success": True,
            "data": entity_types,
            "message": "Supported entity types retrieved successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting entity types: {str(e)}")
        return jsonify({
            "success": False,
            "error": {"message": "Failed to retrieve entity types"},
            "version": "1.0"
        }), 500

@entity_details_bp.route('/<string:entity_type>/<int:entity_id>', methods=['GET'])
def get_entity_details(entity_type: str, entity_id: int):
    """
    Get detailed information for a specific entity
    
    Args:
        entity_type (str): Type of entity (ticker, trade, etc.)
        entity_id (int): ID of the entity
        
    Returns:
        JSON response with entity details
        
    Example:
        GET /api/entity-details/ticker/1
        -> Returns detailed ticker information
    """
    try:
        # Validate entity type
        if not EntityDetailsService.validate_entity_type(entity_type):
            return jsonify({
                "success": False,
                "error": {"message": f"Unsupported entity type: {entity_type}"},
                "version": "1.0"
            }), 400
        
        # Validate entity ID
        if entity_id <= 0:
            return jsonify({
                "success": False,
                "error": {"message": "Entity ID must be a positive integer"},
                "version": "1.0"
            }), 400
        
        db: Session = next(get_db())
        
        # Get entity details
        entity_details = EntityDetailsService.get_entity_details(db, entity_type, entity_id)
        
        if not entity_details:
            return jsonify({
                "success": False,
                "error": {"message": f"{entity_type.title()} with ID {entity_id} not found"},
                "version": "1.0"
            }), 404
        
        return jsonify({
            "success": True,
            "data": entity_details,
            "message": f"Entity details retrieved successfully",
            "version": "1.0"
        })
        
    except ValueError as ve:
        logger.warning(f"Validation error for {entity_type} {entity_id}: {str(ve)}")
        return jsonify({
            "success": False,
            "error": {"message": str(ve)},
            "version": "1.0"
        }), 400
        
    except Exception as e:
        logger.error(f"Error getting entity details for {entity_type} {entity_id}: {str(e)}")
        return jsonify({
            "success": False,
            "error": {"message": "Internal server error"},
            "version": "1.0"
        }), 500
        
    finally:
        db.close()

@entity_details_bp.route('/<string:entity_type>/<int:entity_id>/linked-items', methods=['GET'])
def get_entity_linked_items(entity_type: str, entity_id: int):
    """
    Get linked items for a specific entity
    
    Args:
        entity_type (str): Type of entity
        entity_id (int): ID of the entity
        
    Returns:
        JSON response with linked items
    """
    try:
        # Validate entity type
        if not EntityDetailsService.validate_entity_type(entity_type):
            return jsonify({
                "success": False,
                "error": {"message": f"Unsupported entity type: {entity_type}"},
                "version": "1.0"
            }), 400
        
        # Validate entity ID
        if entity_id <= 0:
            return jsonify({
                "success": False,
                "error": {"message": "Entity ID must be a positive integer"},
                "version": "1.0"
            }), 400
        
        db: Session = next(get_db())
        
        # Check if entity exists first
        entity_details = EntityDetailsService.get_entity_details(db, entity_type, entity_id)
        if not entity_details:
            return jsonify({
                "success": False,
                "error": {"message": f"{entity_type.title()} with ID {entity_id} not found"},
                "version": "1.0"
            }), 404
        
        # Get linked items
        linked_items = EntityDetailsService.get_linked_items(db, entity_type, entity_id)
        
        return jsonify({
            "success": True,
            "data": linked_items,
            "message": f"Linked items retrieved successfully",
            "count": len(linked_items),
            "version": "1.0"
        })
        
    except ValueError as ve:
        logger.warning(f"Validation error for linked items {entity_type} {entity_id}: {str(ve)}")
        return jsonify({
            "success": False,
            "error": {"message": str(ve)},
            "version": "1.0"
        }), 400
        
    except Exception as e:
        logger.error(f"Error getting linked items for {entity_type} {entity_id}: {str(e)}")
        return jsonify({
            "success": False,
            "error": {"message": "Internal server error"},
            "version": "1.0"
        }), 500
        
    finally:
        db.close()

@entity_details_bp.route('/<string:entity_type>/<int:entity_id>/full', methods=['GET'])
def get_entity_full_details(entity_type: str, entity_id: int):
    """
    Get entity details with full linked items data
    
    Args:
        entity_type (str): Type of entity
        entity_id (int): ID of the entity
        
    Returns:
        JSON response with entity details including linked items
    """
    try:
        # Validate entity type
        if not EntityDetailsService.validate_entity_type(entity_type):
            return jsonify({
                "success": False,
                "error": {"message": f"Unsupported entity type: {entity_type}"},
                "version": "1.0"
            }), 400
        
        # Validate entity ID
        if entity_id <= 0:
            return jsonify({
                "success": False,
                "error": {"message": "Entity ID must be a positive integer"},
                "version": "1.0"
            }), 400
        
        db: Session = next(get_db())
        
        # Get entity with linked items
        entity_details = EntityDetailsService.get_entity_with_linked_items(db, entity_type, entity_id)
        
        if not entity_details:
            return jsonify({
                "success": False,
                "error": {"message": f"{entity_type.title()} with ID {entity_id} not found"},
                "version": "1.0"
            }), 404
        
        return jsonify({
            "success": True,
            "data": entity_details,
            "message": f"Full entity details retrieved successfully",
            "linked_items_count": len(entity_details.get('linked_items', [])),
            "version": "1.0"
        })
        
    except ValueError as ve:
        logger.warning(f"Validation error for full details {entity_type} {entity_id}: {str(ve)}")
        return jsonify({
            "success": False,
            "error": {"message": str(ve)},
            "version": "1.0"
        }), 400
        
    except Exception as e:
        logger.error(f"Error getting full entity details for {entity_type} {entity_id}: {str(e)}")
        return jsonify({
            "success": False,
            "error": {"message": "Internal server error"},
            "version": "1.0"
        }), 500
        
    finally:
        db.close()

@entity_details_bp.route('/<string:entity_type>/<int:entity_id>/refresh', methods=['POST'])
def refresh_entity_cache(entity_type: str, entity_id: int):
    """
    Refresh cache for specific entity
    
    Args:
        entity_type (str): Type of entity
        entity_id (int): ID of the entity
        
    Returns:
        JSON response confirming cache refresh
    """
    try:
        # Validate entity type
        if not EntityDetailsService.validate_entity_type(entity_type):
            return jsonify({
                "success": False,
                "error": {"message": f"Unsupported entity type: {entity_type}"},
                "version": "1.0"
            }), 400
        
        # Validate entity ID
        if entity_id <= 0:
            return jsonify({
                "success": False,
                "error": {"message": "Entity ID must be a positive integer"},
                "version": "1.0"
            }), 400
        
        # Invalidate cache
        EntityDetailsService.invalidate_entity_cache(entity_type, entity_id)
        
        return jsonify({
            "success": True,
            "message": f"Cache refreshed successfully for {entity_type} {entity_id}",
            "version": "1.0"
        })
        
    except Exception as e:
        logger.error(f"Error refreshing cache for {entity_type} {entity_id}: {str(e)}")
        return jsonify({
            "success": False,
            "error": {"message": "Failed to refresh cache"},
            "version": "1.0"
        }), 500

@entity_details_bp.route('/<string:entity_type>/<int:entity_id>', methods=['PUT'])
def update_entity_details(entity_type: str, entity_id: int):
    """
    Update entity details (placeholder - delegates to specific entity APIs)
    
    Args:
        entity_type (str): Type of entity
        entity_id (int): ID of the entity
        
    Returns:
        JSON response with update result
    """
    try:
        # Validate entity type
        if not EntityDetailsService.validate_entity_type(entity_type):
            return jsonify({
                "success": False,
                "error": {"message": f"Unsupported entity type: {entity_type}"},
                "version": "1.0"
            }), 400
        
        # For now, redirect to specific entity API
        # This could be enhanced to provide a unified update interface
        return jsonify({
            "success": False,
            "error": {"message": f"Use /api/v1/{entity_type}s/{entity_id} for updates"},
            "redirect": f"/api/v1/{entity_type}s/{entity_id}",
            "version": "1.0"
        }), 302
        
    except Exception as e:
        logger.error(f"Error updating entity {entity_type} {entity_id}: {str(e)}")
        return jsonify({
            "success": False,
            "error": {"message": "Internal server error"},
            "version": "1.0"
        }), 500

@entity_details_bp.route('/<string:entity_type>/<int:entity_id>', methods=['DELETE'])
def delete_entity_details(entity_type: str, entity_id: int):
    """
    Delete entity (placeholder - delegates to specific entity APIs)
    
    Args:
        entity_type (str): Type of entity
        entity_id (int): ID of the entity
        
    Returns:
        JSON response with deletion result
    """
    try:
        # Validate entity type
        if not EntityDetailsService.validate_entity_type(entity_type):
            return jsonify({
                "success": False,
                "error": {"message": f"Unsupported entity type: {entity_type}"},
                "version": "1.0"
            }), 400
        
        # For now, redirect to specific entity API
        # This could be enhanced to provide a unified deletion interface
        return jsonify({
            "success": False,
            "error": {"message": f"Use /api/v1/{entity_type}s/{entity_id} for deletion"},
            "redirect": f"/api/v1/{entity_type}s/{entity_id}",
            "version": "1.0"
        }), 302
        
    except Exception as e:
        logger.error(f"Error deleting entity {entity_type} {entity_id}: {str(e)}")
        return jsonify({
            "success": False,
            "error": {"message": "Internal server error"},
            "version": "1.0"
        }), 500

# Health check endpoint for entity details system
@entity_details_bp.route('/health', methods=['GET'])
def health_check():
    """Health check for entity details system"""
    try:
        db: Session = next(get_db())
        
        # Test basic database connectivity
        db.execute("SELECT 1")
        
        # Get system statistics
        supported_types = EntityDetailsService.get_supported_entity_types()
        
        return jsonify({
            "success": True,
            "data": {
                "status": "healthy",
                "supported_entity_types": supported_types,
                "entity_count": len(supported_types),
                "database_connected": True,
                "service_version": "1.0.0"
            },
            "message": "Entity details system is healthy",
            "version": "1.0"
        })
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            "success": False,
            "data": {
                "status": "unhealthy",
                "database_connected": False,
                "error": str(e)
            },
            "error": {"message": "Entity details system health check failed"},
            "version": "1.0"
        }), 500
        
    finally:
        try:
            db.close()
        except:
            pass  # Ignore close errors in health check

# Error handlers for this blueprint
@entity_details_bp.errorhandler(400)
def handle_bad_request(e):
    """Handle 400 Bad Request errors"""
    return jsonify({
        "success": False,
        "error": {"message": "Bad request - invalid parameters"},
        "version": "1.0"
    }), 400

@entity_details_bp.errorhandler(404) 
def handle_not_found(e):
    """Handle 404 Not Found errors"""
    return jsonify({
        "success": False,
        "error": {"message": "Entity not found"},
        "version": "1.0"
    }), 404

@entity_details_bp.errorhandler(500)
def handle_internal_error(e):
    """Handle 500 Internal Server Error"""
    logger.error(f"Internal server error in entity details: {str(e)}")
    return jsonify({
        "success": False,
        "error": {"message": "Internal server error"},
        "version": "1.0"
    }), 500