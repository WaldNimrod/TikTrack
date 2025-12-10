from flask import Blueprint, request, jsonify
from Backend.services.eod_metrics_service import EODMetricsService
from Backend.services.recompute_service import RecomputeService
from .base_entity_decorators import require_authentication

eod_bp = Blueprint('eod_metrics', __name__)

eod_service = EODMetricsService()
recompute_service = RecomputeService()

@eod_bp.route('/portfolio', methods=['GET'])
@require_authentication()
def get_portfolio_metrics():
    """שליפת מדדי פורטפוליו"""
    from flask import g
    user_id = g.user_id
    filters = {
        'account_id': request.args.get('account_id', type=int),
        'date_from': request.args.get('date_from'),
        'date_to': request.args.get('date_to'),
        'include_positions': request.args.get('include_positions', 'false').lower() == 'true'
    }

    try:
        metrics = eod_service.get_portfolio_metrics(user_id, filters)
        return jsonify({'data': metrics, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@eod_bp.route('/positions', methods=['GET'])
@require_authentication()
def get_positions():
    """שליפת פוזיציות יומיות"""
    from flask import g
    user_id = g.user_id
    filters = {
        'account_id': request.args.get('account_id', type=int),
        'ticker_id': request.args.get('ticker_id', type=int),
        'date_from': request.args.get('date_from'),
        'date_to': request.args.get('date_to')
    }

    try:
        positions = eod_service.get_positions(user_id, filters)
        return jsonify({'data': positions, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@eod_bp.route('/cash-flows', methods=['GET'])
@require_authentication()
def get_cash_flows():
    from flask import g
    """שליפת תזרימי מזומן מצטברים"""
    user_id = g.user_id
    filters = {
        'account_id': request.args.get('account_id', type=int),
        'date_from': request.args.get('date_from'),
        'date_to': request.args.get('date_to')
    }

    try:
        cash_flows = eod_service.get_cash_flows_agg(user_id, filters)
        return jsonify({'data': cash_flows, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@eod_bp.route('/recompute', methods=['POST'])
@require_authentication()
def recompute_metrics():
    from flask import g
    """הפעלת חישוב מחדש"""
    user_id = g.user_id
    data = request.get_json()

    if not data or not data.get('date_from') or not data.get('date_to'):
        return jsonify({'error': 'Missing required fields: date_from, date_to', 'status': 'error'}), 400

    try:
        result = recompute_service.recompute_user_date_range(
            user_id=user_id,
            start_date=data['date_from'],
            end_date=data['date_to'],
            account_ids=data.get('account_ids')
        )
        return jsonify(result), 202  # Accepted
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@eod_bp.route('/recompute/<job_id>', methods=['GET'])
@require_authentication()
def get_recompute_status(job_id):
    """קבלת סטטוס job"""
    try:
        status = recompute_service.get_recompute_status(job_id)
        return jsonify(status)
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@eod_bp.route('/recompute/history', methods=['GET'])
@require_authentication()
def get_recompute_history():
    from flask import g
    """קבלת היסטוריית jobs"""
    user_id = g.user_id
    limit = request.args.get('limit', 10, type=int)

    try:
        jobs = recompute_service.get_user_jobs(user_id, limit)
        return jsonify({'data': jobs, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

# System & Monitoring APIs

@eod_bp.route('/jobs/status', methods=['GET'])
@require_authentication()
def get_job_status():
    """קבלת סטטוס משימות EOD"""
    from flask import g
    user_id = g.user_id
    filters = {
        'job_type': request.args.get('job_type'),
        'status': request.args.get('status')
    }

    try:
        status = eod_service.get_job_status(user_id, filters)
        return jsonify({'data': status, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@eod_bp.route('/jobs/history', methods=['GET'])
@require_authentication()
def get_job_history():
    """קבלת היסטוריית משימות EOD"""
    from flask import g
    user_id = g.user_id
    filters = {
        'limit': request.args.get('limit', 10, type=int),
        'job_type': request.args.get('job_type'),
        'date_from': request.args.get('date_from')
    }

    try:
        history = eod_service.get_job_history(user_id, filters)
        return jsonify({'data': history, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@eod_bp.route('/performance', methods=['GET'])
@require_authentication()
def get_performance_stats():
    """קבלת סטטיסטיקות ביצועים של EOD"""
    from flask import g
    user_id = g.user_id
    filters = {
        'period': request.args.get('period', '24h')
    }

    try:
        stats = eod_service.get_performance_stats(user_id, filters)
        return jsonify({'data': stats, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

# Data Access APIs

@eod_bp.route('/tables/<table_name>', methods=['GET'])
@require_authentication()
def get_table_data(table_name):
    """קבלת נתוני טבלה ישירות"""
    from flask import g
    user_id = g.user_id
    filters = {
        'limit': request.args.get('limit', 100, type=int),
        'offset': request.args.get('offset', 0, type=int),
        'date_from': request.args.get('date_from'),
        'date_to': request.args.get('date_to')
    }

    try:
        data = eod_service.get_table_data(user_id, table_name, filters)
        return jsonify({'data': data, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@eod_bp.route('/alerts', methods=['GET'])
@require_authentication()
def get_validation_alerts():
    """קבלת התראות מבוססות EOD"""
    from flask import g
    user_id = g.user_id
    filters = {
        'severity': request.args.get('severity'),
        'date_from': request.args.get('date_from')
    }

    try:
        alerts = eod_service.get_validation_alerts(user_id, filters)
        return jsonify({'data': alerts, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@eod_bp.route('/comparison', methods=['GET'])
@require_authentication()
def get_comparison_data():
    """קבלת נתונים להשוואות היסטוריות"""
    from flask import g
    user_id = g.user_id
    filters = {
        'date_ranges': request.args.get('date_ranges'),
        'metrics': request.args.get('metrics')
    }

    # Parse JSON parameters
    if filters.date_ranges:
        try:
            filters.date_ranges = eval(filters.date_ranges)  # Safe since we control input
        except:
            filters.date_ranges = None

    if filters.metrics:
        try:
            filters.metrics = eval(filters.metrics)  # Safe since we control input
        except:
            filters.metrics = None

    try:
        data = eod_service.get_comparison_data(user_id, filters)
        return jsonify({'data': data, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500
