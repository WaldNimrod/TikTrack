"""
Email Logs API - TikTrack
API endpoints for email logs

This module provides endpoints for:
- Retrieving email logs
- Filtering email logs by status, type, recipient, date range
- Getting email log statistics

Author: TikTrack Development Team
Version: 1.0.0
Last Updated: January 28, 2025
"""

from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from config.database import get_db
from models.email_log import EmailLog
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import logging
from .base_entity_decorators import handle_database_session

logger = logging.getLogger(__name__)

# Create blueprint
email_logs_bp = Blueprint('email_logs', __name__, url_prefix='/api/email-logs')


@email_logs_bp.route('', methods=['GET'])
@handle_database_session()
def get_email_logs():
    """
    Get email logs with optional filtering (filtered by authenticated user)
    
    Query Parameters:
        - status: Filter by status (success, failed, pending)
        - email_type: Filter by email type (password_reset, test, etc.)
        - recipient: Filter by recipient email
        - days: Number of days to look back (default: 7)
        - limit: Maximum number of logs to return (default: 100)
        - offset: Offset for pagination (default: 0)
        - sort_by: Field to sort by (default: created_at)
        - sort_order: Sort order (asc, desc) (default: desc)
    
    Returns:
        JSON: Email logs with metadata
    """
    db: Session = g.db
    
    # Get user_id from Flask context (set by auth middleware)
    user_id = getattr(g, 'user_id', None)
    
    if user_id is None:
        return jsonify({
            'success': False,
            'error': 'User authentication required'
        }), 401
    
    try:
        # Get query parameters
        status = request.args.get('status')
        email_type = request.args.get('email_type')
        recipient = request.args.get('recipient')
        days = int(request.args.get('days', 7))
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
        sort_by = request.args.get('sort_by', 'created_at')
        sort_order = request.args.get('sort_order', 'desc')
        
        # Build query - always filter by authenticated user
        query = db.query(EmailLog).filter(EmailLog.user_id == user_id)
        
        # Apply filters
        if status:
            query = query.filter(EmailLog.status == status)
        
        if email_type:
            query = query.filter(EmailLog.email_type == email_type)
        
        if recipient:
            query = query.filter(EmailLog.recipient == recipient)
        
        # Date range filter
        if days > 0:
            date_from = datetime.now() - timedelta(days=days)
            query = query.filter(EmailLog.created_at >= date_from)
        
        # Apply sorting
        if hasattr(EmailLog, sort_by):
            sort_column = getattr(EmailLog, sort_by)
            if sort_order.lower() == 'asc':
                query = query.order_by(sort_column.asc())
            else:
                query = query.order_by(sort_column.desc())
        else:
            # Default sorting
            query = query.order_by(EmailLog.created_at.desc())
        
        # Get total count before pagination
        total_count = query.count()
        
        # Apply pagination
        logs = query.offset(offset).limit(limit).all()
        
        # Convert to dict
        logs_data = [log.to_dict() for log in logs]
        
        return jsonify({
            'success': True,
            'data': {
                'logs': logs_data,
                'pagination': {
                    'total': total_count,
                    'limit': limit,
                    'offset': offset,
                    'count': len(logs_data)
                },
                'filters': {
                    'status': status,
                    'email_type': email_type,
                    'recipient': recipient,
                    'days': days
                },
                'sort': {
                    'sort_by': sort_by,
                    'sort_order': sort_order
                }
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting email logs: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Failed to get email logs: {str(e)}'
        }), 500


@email_logs_bp.route('/statistics', methods=['GET'])
@handle_database_session()
def get_email_log_statistics():
    """
    Get email log statistics (filtered by authenticated user)
    
    Query Parameters:
        - days: Number of days to look back (default: 7)
    
    Returns:
        JSON: Email log statistics
    """
    db: Session = g.db
    
    # Get user_id from Flask context (set by auth middleware)
    user_id = getattr(g, 'user_id', None)
    
    if user_id is None:
        return jsonify({
            'success': False,
            'error': 'User authentication required'
        }), 401
    
    try:
        days = int(request.args.get('days', 7))
        date_from = datetime.now() - timedelta(days=days) if days > 0 else None
        
        # Build base query - always filter by authenticated user
        base_query = db.query(EmailLog).filter(EmailLog.user_id == user_id)
        if date_from:
            base_query = base_query.filter(EmailLog.created_at >= date_from)
        
        # Total count
        total = base_query.count()
        
        # By status
        success = base_query.filter(EmailLog.status == 'success').count()
        failed = base_query.filter(EmailLog.status == 'failed').count()
        pending = base_query.filter(EmailLog.status == 'pending').count()
        
        # By email type
        type_counts = db.query(
            EmailLog.email_type,
            func.count(EmailLog.id).label('count')
        ).filter(EmailLog.user_id == user_id)
        if date_from:
            type_counts = type_counts.filter(EmailLog.created_at >= date_from)
        type_counts = type_counts.group_by(EmailLog.email_type).all()
        
        type_stats = {email_type or 'unknown': count for email_type, count in type_counts}
        
        # Top recipients
        recipient_counts = db.query(
            EmailLog.recipient,
            func.count(EmailLog.id).label('count')
        ).filter(EmailLog.user_id == user_id)
        if date_from:
            recipient_counts = recipient_counts.filter(EmailLog.created_at >= date_from)
        recipient_counts = recipient_counts.group_by(EmailLog.recipient).order_by(
            func.count(EmailLog.id).desc()
        ).limit(10).all()
        
        top_recipients = [{'recipient': recipient, 'count': count} for recipient, count in recipient_counts]
        
        # Daily distribution (last 7 days)
        daily_distribution = []
        for i in range(min(days, 7)):
            day_start = datetime.now() - timedelta(days=i+1)
            day_end = datetime.now() - timedelta(days=i)
            count = db.query(EmailLog).filter(
                and_(
                    EmailLog.user_id == user_id,
                    EmailLog.created_at >= day_start,
                    EmailLog.created_at < day_end
                )
            ).count()
            daily_distribution.append({
                'date': day_start.strftime('%Y-%m-%d'),
                'count': count
            })
        
        return jsonify({
            'success': True,
            'data': {
                'total': total,
                'by_status': {
                    'success': success,
                    'failed': failed,
                    'pending': pending
                },
                'by_type': type_stats,
                'top_recipients': top_recipients,
                'daily_distribution': daily_distribution,
                'period': {
                    'days': days,
                    'from': date_from.isoformat() if date_from else None,
                    'to': datetime.now().isoformat()
                }
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting email log statistics: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Failed to get email log statistics: {str(e)}'
        }), 500


@email_logs_bp.route('/<int:log_id>', methods=['GET'])
@handle_database_session()
def get_email_log(log_id: int):
    """
    Get a specific email log by ID (filtered by authenticated user)
    
    Args:
        log_id: Email log ID
    
    Returns:
        JSON: Email log details
    """
    db: Session = g.db
    
    # Get user_id from Flask context (set by auth middleware)
    user_id = getattr(g, 'user_id', None)
    
    if user_id is None:
        return jsonify({
            'success': False,
            'error': 'User authentication required'
        }), 401
    
    try:
        log = db.query(EmailLog).filter(
            EmailLog.id == log_id,
            EmailLog.user_id == user_id
        ).first()
        
        if not log:
            return jsonify({
                'success': False,
                'error': f'Email log with ID {log_id} not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': log.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting email log {log_id}: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Failed to get email log: {str(e)}'
        }), 500

