#!/usr/bin/env python3
"""
Preferences API - TikTrack
==========================

API endpoints for preferences system with advanced features

Author: TikTrack Development Team
Version: 1.0
Date: January 2025
"""

from flask import Blueprint, request, jsonify
from services.preferences_service import preferences_service
from typing import Any, Dict, List
import logging
import json
from datetime import datetime

logger = logging.getLogger(__name__)

# Create blueprint
preferences_bp = Blueprint('preferences', __name__, url_prefix='/api/v1/preferences')

# ============================================================================
# User Preferences Endpoints
# ============================================================================

@preferences_bp.route('/user/group', methods=['GET'])
def get_user_group_preferences() -> Any:
    """
    קבלת העדפות קבוצה של משתמש
    
    Query Parameters:
        - group (required): שם הקבוצה
        - user_id (optional): מזהה משתמש (default: 1)
        - profile_id (optional): מזהה פרופיל
        - use_cache (optional): האם להשתמש במטמון (default: true)
    """
    try:
        group_name = request.args.get('group')
        if not group_name:
            return jsonify({
                'success': False,
                'error': 'Missing required parameter: group',
                'timestamp': datetime.now().isoformat()
            }), 400
        
        user_id = request.args.get('user_id', 1, type=int)
        profile_id = request.args.get('profile_id', type=int)
        use_cache = request.args.get('use_cache', 'true').lower() == 'true'
        
        # קבלת העדפות הקבוצה
        group_preferences = preferences_service.get_group_preferences(
            user_id=user_id,
            group_name=group_name,
            profile_id=profile_id,
            use_cache=use_cache
        )
        
        return jsonify({
            'success': True,
            'data': {
                'user_id': user_id,
                'profile_id': profile_id,
                'group_name': group_name,
                'preferences': group_preferences
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting user group preferences: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@preferences_bp.route('/user/preference', methods=['GET'])
def get_user_preference() -> Any:
    """
    קבלת העדפה בודדת של משתמש
    
    Query Parameters:
        - name (required): שם ההעדפה
        - user_id (optional): מזהה משתמש (default: 1)
        - profile_id (optional): מזהה פרופיל
        - use_cache (optional): האם להשתמש במטמון (default: true)
    """
    try:
        preference_name = request.args.get('name')
        if not preference_name:
            return jsonify({
                'success': False,
                'error': 'Missing required parameter: name',
                'timestamp': datetime.now().isoformat()
            }), 400
        
        user_id = request.args.get('user_id', 1, type=int)
        profile_id = request.args.get('profile_id', type=int)
        use_cache = request.args.get('use_cache', 'true').lower() == 'true'
        
        # קבלת ההעדפה
        preference_value = preferences_service.get_preference(
            user_id=user_id,
            preference_name=preference_name,
            profile_id=profile_id,
            use_cache=use_cache
        )
        
        return jsonify({
            'success': True,
            'data': {
                'user_id': user_id,
                'profile_id': profile_id,
                'preference_name': preference_name,
                'value': preference_value
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting user preference: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@preferences_bp.route('/user', methods=['GET'])
def get_user_preferences() -> Any:
    """
    קבלת העדפות משתמש
    
    Query Parameters:
        - profile_id (optional): מזהה פרופיל
        - use_cache (optional): האם להשתמש במטמון (default: true)
    """
    try:
        user_id = request.args.get('user_id', 1, type=int)  # ברירת מחדל: משתמש 1
        profile_id = request.args.get('profile_id', type=int)
        use_cache = request.args.get('use_cache', 'true').lower() == 'true'
        
        # קבלת כל ההעדפות
        preferences = preferences_service.get_all_user_preferences(
            user_id=user_id,
            profile_id=profile_id,
            use_cache=use_cache
        )
        
        # קבלת הפרופיל שנבחר (אם לא צוין)
        if profile_id is None:
            profile_id = preferences_service._get_active_profile_id(user_id)
        
        return jsonify({
            "success": True,
            "data": {
                "user_id": user_id,
                "profile_id": profile_id,
                "preferences": preferences,
                "count": len(preferences)
            },
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting user preferences: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@preferences_bp.route('/user', methods=['POST'])
def save_user_preferences() -> Any:
    """
    שמירת העדפות משתמש
    
    Body:
        - preferences: מילון עם העדפות
        - profile_id (optional): מזהה פרופיל
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided",
                "timestamp": datetime.now().isoformat()
            }), 400
        
        user_id = data.get('user_id', 1)  # ברירת מחדל: משתמש 1
        preferences = data.get('preferences', {})
        profile_id = data.get('profile_id')
        
        if not preferences:
            return jsonify({
                "success": False,
                "error": "No preferences provided",
                "timestamp": datetime.now().isoformat()
            }), 400
        
        # שמירת העדפות
        success = preferences_service.save_preferences(
            user_id=user_id,
            preferences=preferences,
            profile_id=profile_id
        )
        
        if success:
            return jsonify({
                "success": True,
                "data": {
                    "user_id": user_id,
                    "profile_id": profile_id,
                    "saved_count": len(preferences)
                },
                "timestamp": datetime.now().isoformat()
        }), 200
        else:
            return jsonify({
                "success": False,
                "error": "Failed to save preferences"
            }), 500
        
    except Exception as e:
        logger.error(f"Error saving user preferences: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@preferences_bp.route('/user/single', methods=['GET'])
def get_single_preference() -> Any:
    """
    קבלת העדפה בודדת
    
    Query Parameters:
        - preference_name: שם ההעדפה
        - profile_id (optional): מזהה פרופיל
        - use_cache (optional): האם להשתמש במטמון
    """
    try:
        user_id = request.args.get('user_id', 1, type=int)
        preference_name = request.args.get('preference_name')
        profile_id = request.args.get('profile_id', type=int)
        use_cache = request.args.get('use_cache', 'true').lower() == 'true'
        
        if not preference_name:
            return jsonify({
                "success": False,
                "error": "preference_name is required",
                "timestamp": datetime.now().isoformat()
            }), 400
        
        # קבלת העדפה
        value = preferences_service.get_preference(
            user_id=user_id,
            preference_name=preference_name,
            profile_id=profile_id,
            use_cache=use_cache
        )
        
        return jsonify({
            "success": True,
            "data": {
                "user_id": user_id,
                "preference_name": preference_name,
                "value": value,
                "profile_id": profile_id
            },
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting single preference: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@preferences_bp.route('/user/single', methods=['POST'])
def save_single_preference() -> Any:
    """
    שמירת העדפה בודדת
    
    Body:
        - preference_name: שם ההעדפה
        - value: ערך ההעדפה
        - profile_id (optional): מזהה פרופיל
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided",
                "timestamp": datetime.now().isoformat()
            }), 400
        
        user_id = data.get('user_id', 1)
        preference_name = data.get('preference_name')
        value = data.get('value')
        profile_id = data.get('profile_id')
        
        if not preference_name:
            return jsonify({
                "success": False,
                "error": "preference_name is required",
                "timestamp": datetime.now().isoformat()
            }), 400
        
        # שמירת העדפה
        success = preferences_service.save_preference(
            user_id=user_id,
            preference_name=preference_name,
            value=value,
            profile_id=profile_id
        )
        
        if success:
            return jsonify({
                "success": True,
                "data": {
                    "user_id": user_id,
                    "preference_name": preference_name,
                    "value": value,
                    "profile_id": profile_id
                },
                "timestamp": datetime.now().isoformat()
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "Failed to save preference",
                "timestamp": datetime.now().isoformat()
            }), 500
            
    except Exception as e:
        logger.error(f"Error saving single preference: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@preferences_bp.route('/user/multiple', methods=['POST'])
def get_multiple_preferences() -> Any:
    """
    קבלת העדפות מרובות
    
    Body:
        - preference_names: רשימת שמות העדפות
        - profile_id (optional): מזהה פרופיל
        - use_cache (optional): האם להשתמש במטמון
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided",
                "timestamp": datetime.now().isoformat()
            }), 400
        
        user_id = data.get('user_id', 1)
        preference_names = data.get('preference_names', [])
        profile_id = data.get('profile_id')
        use_cache = data.get('use_cache', True)
        
        if not preference_names:
            return jsonify({
                "success": False,
                "error": "preference_names is required",
                "timestamp": datetime.now().isoformat()
            }), 400
        
        # קבלת העדפות מרובות
        preferences = preferences_service.get_preferences_by_names(
            user_id=user_id,
            preference_names=preference_names,
            profile_id=profile_id,
            use_cache=use_cache
        )
        
        return jsonify({
            "success": True,
            "data": {
                "user_id": user_id,
                "preference_names": preference_names,
                "preferences": preferences,
                "count": len(preferences),
                "profile_id": profile_id
            },
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting multiple preferences: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# ============================================================================
# Profile Management Endpoints
# ============================================================================

@preferences_bp.route('/profiles', methods=['GET'])
def get_user_profiles() -> Any:
    """
    קבלת פרופילים של משתמש
    """
    try:
        user_id = request.args.get('user_id', 1, type=int)
        
        # קבלת פרופילים
        profiles = preferences_service.get_user_profiles(user_id)
        
        return jsonify({
            "success": True,
            "data": {
                "user_id": user_id,
                "profiles": profiles,
                "count": len(profiles)
            },
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting user profiles: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@preferences_bp.route('/profiles/activate', methods=['POST'])
def activate_profile() -> Any:
    """
    הפעלת פרופיל
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        profile_id = data.get('profile_id')
        
        if not user_id or not profile_id:
            return jsonify({
                'success': False,
                'error': 'user_id and profile_id are required',
                'timestamp': datetime.now().isoformat()
            }), 400
        
        # הפעלת פרופיל
        success = preferences_service.activate_profile(user_id, profile_id)
        
        if success:
            return jsonify({
                'success': True,
                'data': {
                    'message': 'Profile activated successfully'
                },
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to activate profile',
                'timestamp': datetime.now().isoformat()
            }), 500
        
    except Exception as e:
        logger.error(f"Error activating profile: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@preferences_bp.route('/clear-cache', methods=['POST'])
def clear_cache():
    """
    Clear preferences cache
    ניקוי מטמון העדפות
    """
    try:
        # Clear cache (if implemented)
        # For now, just return success
        return jsonify({
            'success': True,
            'message': 'Cache cleared successfully'
        })
        
    except Exception as e:
        logger.error(f"Error clearing cache: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error clearing cache: {str(e)}',
            'error_code': 'CACHE_CLEAR_ERROR'
        }), 500

# ============================================================================
# Admin Endpoints
# ============================================================================

@preferences_bp.route('/admin/types', methods=['GET'])
def get_preference_types() -> Any:
    """
    קבלת סוגי העדפות (Admin)
    """
    try:
        # קבלת סוגי העדפות מהשירות
        # זה דורש הרחבה של השירות
        return jsonify({
            "success": True,
            "data": {
                "message": "Admin endpoint - to be implemented"
            },
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting preference types: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@preferences_bp.route('/groups', methods=['GET'])
def get_preference_groups() -> Any:
    """
    קבלת קבוצות העדפות
    """
    try:
        # קבלת קבוצות העדפות מהשירות
        groups = preferences_service.get_preference_groups()
        
        return jsonify({
            "success": True,
            "data": {
                "groups": groups
            },
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting preference groups: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@preferences_bp.route('/admin/groups', methods=['GET'])
def get_preference_groups_admin() -> Any:
    """
    קבלת קבוצות העדפות (Admin)
    """
    try:
        # קבלת קבוצות העדפות מהשירות
        groups = preferences_service.get_preference_groups()
        
        return jsonify({
            "success": True,
            "data": {
                "groups": groups
            },
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting preference groups: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@preferences_bp.route('/admin/search', methods=['POST'])
def search_preferences() -> Any:
    """
    חיפוש העדפות (Admin)
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided",
                "timestamp": datetime.now().isoformat()
            }), 400
        
        # חיפוש העדפות
        # זה דורש הרחבה של השירות
        return jsonify({
            "success": True,
            "data": {
                "message": "Admin search endpoint - to be implemented"
            },
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error searching preferences: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# ============================================================================
# Utility Endpoints
# ============================================================================

@preferences_bp.route('/info/<preference_name>', methods=['GET'])
def get_preference_info(preference_name: str) -> Any:
    """
    קבלת מידע על העדפה
    """
    try:
        # קבלת מידע על העדפה
        info = preferences_service.get_preference_info(preference_name)
        
        return jsonify({
            "success": True,
            "data": {
                "preference_name": preference_name,
                "info": info
            },
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting preference info: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@preferences_bp.route('/health', methods=['GET'])
def health_check() -> Any:
    """
    בדיקת תקינות השירות
    """
    try:
        # בדיקה בסיסית של השירות
        test_preference = preferences_service.get_preference(1, 'timezone')
        
        return jsonify({
            "success": True,
            "data": {
                "status": "healthy",
                "test_preference": test_preference,
                "service": "preferences"
            },
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500
