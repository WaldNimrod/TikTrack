"""
Query Optimization API - TikTrack
API endpoints for managing the smart query optimization system.

This module provides endpoints for:
- Query performance reports
- Optimization suggestions
- Query profiling data
- Performance monitoring

Author: TikTrack Development Team
Created: September 2025
Version: 1.0
"""

from flask import Blueprint, jsonify, request, g
from services.smart_query_optimizer import (
    get_performance_report,
    clear_query_profiles,
    export_query_profiles
)
from services.advanced_cache_service import cache_for, invalidate_cache
import logging
import tempfile
import os
from datetime import datetime

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

# Create blueprint
query_optimization_bp = Blueprint('query_optimization', __name__, url_prefix='/api/v1/query-optimization')

# Initialize base API (query optimization is complex, so we'll use it selectively)


@query_optimization_bp.route('/', methods=['GET'])
@api_endpoint(cache_ttl=60, rate_limit=60)
@handle_database_session()
@cache_for(ttl=60)  # Cache for 1 minute - system status doesn't change frequently
def get_query_optimization_status():
    """Get query optimization system status using base API patterns"""
    try:
        return jsonify({
            'status': 'success',
            'data': {
                'system': 'Query Optimization System',
                'version': '2.0.0',
                'status': 'active',
                'endpoints': [
                    '/performance-report',
                    '/slow-queries', 
                    '/optimization-opportunities',
                    '/stats',
                    '/info'
                ],
                'timestamp': datetime.now().isoformat()
            }
        }), 200
    except Exception as e:
        logger.error(f"Failed to get status: {e}")
        return jsonify({
            'status': 'error',
            'error': {'message': f'Failed to get status: {str(e)}'},
            'version': 'v1'
        }), 500


@query_optimization_bp.route('/performance-report', methods=['GET'])
def get_query_performance_report():
    """Get comprehensive query performance report"""
    try:
        report = get_performance_report()
        return jsonify({
            'status': 'success',
            'data': report
        }), 200
    except Exception as e:
        logger.error(f"Failed to get performance report: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get performance report: {str(e)}'
        }), 500


@query_optimization_bp.route('/slow-queries', methods=['GET'])
def get_slow_queries():
    """Get list of slow queries"""
    try:
        report = get_performance_report()
        
        if 'error' in report:
            return jsonify({
                'status': 'error',
                'message': report['error']
            }), 500
        
        slow_queries = report.get('top_slow_queries', [])
        
        return jsonify({
            'status': 'success',
            'data': {
                'slow_queries': slow_queries,
                'total_slow_queries': report.get('slow_queries', 0),
                'threshold_seconds': 1.0  # From optimizer configuration
            }
        }), 200
    except Exception as e:
        logger.error(f"Failed to get slow queries: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get slow queries: {str(e)}'
        }), 500


@query_optimization_bp.route('/optimization-opportunities', methods=['GET'])
def get_optimization_opportunities():
    """Get queries with optimization opportunities"""
    try:
        report = get_performance_report()
        
        if 'error' in report:
            return jsonify({
                'status': 'error',
                'message': report['error']
            }), 500
        
        opportunities = report.get('optimization_opportunities', [])
        
        return jsonify({
            'status': 'success',
            'data': {
                'opportunities': opportunities,
                'total_opportunities': len(opportunities)
            }
        }), 200
    except Exception as e:
        logger.error(f"Failed to get optimization opportunities: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get optimization opportunities: {str(e)}'
        }), 500


@query_optimization_bp.route('/optimize', methods=['POST'])
def optimize_database():
    """Optimize database performance"""
    try:
        # Clear query profiles to start fresh
        clear_query_profiles()
        
        # Get current performance report
        report = get_performance_report()
        
        # Log optimization action
        logger.info("Database optimization performed by API request")
        
        return jsonify({
            'status': 'success',
            'message': 'Database optimization completed successfully',
            'data': {
                'optimization_performed': True,
                'profiles_cleared': True,
                'current_performance': report,
                'timestamp': datetime.now().isoformat()
            }
        }), 200
    except Exception as e:
        logger.error(f"Failed to optimize database: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to optimize database: {str(e)}'
        }), 500

@query_optimization_bp.route('/clear-profiles', methods=['POST'])
def clear_all_query_profiles():
    """Clear all query profiles"""
    try:
        clear_query_profiles()
        logger.info("Query profiles cleared by API request")
        return jsonify({
            'status': 'success',
            'message': 'Query profiles cleared successfully'
        }), 200
    except Exception as e:
        logger.error(f"Failed to clear query profiles: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to clear query profiles: {str(e)}'
        }), 500


@query_optimization_bp.route('/export-profiles', methods=['POST'])
def export_query_profiles_to_file():
    """Export query profiles to file"""
    try:
        data = request.get_json()
        if not data or 'filepath' not in data:
            return jsonify({
                'status': 'error',
                'message': 'filepath field is required'
            }), 400
        
        filepath = data['filepath']
        
        # Validate filepath (basic security check)
        if not filepath.endswith('.json'):
            return jsonify({
                'status': 'error',
                'message': 'Only JSON files are allowed'
            }), 400
        
        # Export profiles
        export_query_profiles(filepath)
        
        logger.info(f"Query profiles exported to {filepath}")
        return jsonify({
            'status': 'success',
            'message': f'Query profiles exported to {filepath}',
            'data': {
                'filepath': filepath,
                'exported_at': datetime.utcnow().isoformat()
            }
        }), 200
    except Exception as e:
        logger.error(f"Failed to export query profiles: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to export query profiles: {str(e)}'
        }), 500


@query_optimization_bp.route('/export-profiles/temp', methods=['POST'])
def export_query_profiles_to_temp():
    """Export query profiles to temporary file"""
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False, encoding='utf-8') as f:
            temp_filepath = f.name
        
        # Export profiles to temp file
        export_query_profiles(temp_filepath)
        
        # Read file content
        with open(temp_filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Clean up temp file
        os.unlink(temp_filepath)
        
        logger.info("Query profiles exported to temporary file and returned")
        return jsonify({
            'status': 'success',
            'message': 'Query profiles exported successfully',
            'data': {
                'content': content,
                'exported_at': datetime.utcnow().isoformat()
            }
        }), 200
    except Exception as e:
        logger.error(f"Failed to export query profiles to temp: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to export query profiles: {str(e)}'
        }), 500


@query_optimization_bp.route('/stats', methods=['GET'])
def get_query_optimization_stats():
    """Get query optimization statistics"""
    try:
        report = get_performance_report()
        
        if 'error' in report:
            return jsonify({
                'status': 'error',
                'message': report['error']
            }), 500
        
        # Calculate additional statistics
        total_queries = report.get('total_queries', 0)
        slow_queries = report.get('slow_queries', 0)
        avg_execution_time = report.get('avg_execution_time', 0)
        
        # Calculate percentages
        slow_query_percentage = (slow_queries / total_queries * 100) if total_queries > 0 else 0
        
        # Get optimization opportunities
        opportunities = report.get('optimization_opportunities', [])
        total_potential_improvement = sum(opp.get('potential_improvement', 0) for opp in opportunities)
        
        stats = {
            'total_queries': total_queries,
            'slow_queries': slow_queries,
            'slow_query_percentage': round(slow_query_percentage, 2),
            'avg_execution_time': round(avg_execution_time, 3),
            'optimization_opportunities': len(opportunities),
            'total_potential_improvement': round(total_potential_improvement * 100, 1),  # Convert to percentage
            'performance_grade': _calculate_performance_grade(slow_query_percentage, avg_execution_time)
        }
        
        return jsonify({
            'status': 'success',
            'data': stats
        }), 200
    except Exception as e:
        logger.error(f"Failed to get optimization stats: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get optimization stats: {str(e)}'
        }), 500


@query_optimization_bp.route('/info', methods=['GET'])
def get_query_optimization_info():
    """Get query optimization system information"""
    try:
        info = {
            'system_name': 'Smart Query Optimizer',
            'version': '1.0',
            'features': [
                'Automatic N+1 query detection',
                'Smart eager loading recommendations',
                'Query performance profiling',
                'Automatic optimization suggestions',
                'Performance monitoring and reporting'
            ],
            'optimization_patterns': [
                'ticker_queries',
                'trade_queries', 
                'account_queries',
                'execution_queries'
            ],
            'performance_thresholds': {
                'slow_query_threshold': '1.0 seconds',
                'n_plus_one_threshold': '0.1 seconds per iteration',
                'memory_threshold': '50.0 MB',
                'row_count_threshold': '1000 rows'
            },
            'supported_optimizations': [
                'Eager loading (joinedload, selectinload)',
                'Selective loading',
                'Query complexity analysis',
                'Performance profiling',
                'Optimization suggestions'
            ]
        }
        
        return jsonify({
            'status': 'success',
            'data': info
        }), 200
    except Exception as e:
        logger.error(f"Failed to get optimization info: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get optimization info: {str(e)}'
        }), 500


def _calculate_performance_grade(slow_query_percentage: float, avg_execution_time: float) -> str:
    """Calculate performance grade based on metrics"""
    try:
        # Grade based on slow query percentage
        if slow_query_percentage < 5:
            grade = 'A'
        elif slow_query_percentage < 15:
            grade = 'B'
        elif slow_query_percentage < 30:
            grade = 'C'
        elif slow_query_percentage < 50:
            grade = 'D'
        else:
            grade = 'F'
        
        # Adjust grade based on average execution time
        if avg_execution_time > 2.0:
            grade = chr(ord(grade) + 1) if ord(grade) < ord('F') else 'F'
        elif avg_execution_time < 0.1:
            grade = chr(ord(grade) - 1) if ord(grade) > ord('A') else 'A'
        
        return grade
        
    except Exception as e:
        logger.error(f"Failed to calculate performance grade: {e}")
        return 'N/A'


# Import datetime for the export function
from datetime import datetime
