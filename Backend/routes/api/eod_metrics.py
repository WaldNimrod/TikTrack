from flask import Blueprint, request, jsonify
from Backend.services.eod_metrics_service import EODMetricsService
from Backend.services.recompute_service import RecomputeService
from Backend.utils.auth import require_auth

eod_bp = Blueprint('eod_metrics', __name__)

eod_service = EODMetricsService()
recompute_service = RecomputeService()

@eod_bp.route('/portfolio', methods=['GET'])
@require_auth
def get_portfolio_metrics():
    """שליפת מדדי פורטפוליו"""
    user_id = request.user_id
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
@require_auth
def get_positions():
    """שליפת פוזיציות יומיות"""
    user_id = request.user_id
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
@require_auth
def get_cash_flows():
    """שליפת תזרימי מזומן מצטברים"""
    user_id = request.user_id
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
@require_auth
def recompute_metrics():
    """הפעלת חישוב מחדש"""
    user_id = request.user_id
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
@require_auth
def get_recompute_status(job_id):
    """קבלת סטטוס job"""
    try:
        status = recompute_service.get_recompute_status(job_id)
        return jsonify(status)
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@eod_bp.route('/recompute/history', methods=['GET'])
@require_auth
def get_recompute_history():
    """קבלת היסטוריית jobs"""
    user_id = request.user_id
    limit = request.args.get('limit', 10, type=int)

    try:
        jobs = recompute_service.get_user_jobs(user_id, limit)
        return jsonify({'data': jobs, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500
