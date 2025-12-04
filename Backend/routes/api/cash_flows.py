from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session, joinedload
from config.database import get_db
from models.cash_flow import CashFlow
from models.currency import Currency
from models.trading_account import TradingAccount
from services.validation_service import ValidationService
from services.advanced_cache_service import cache_for, invalidate_cache
from services.cash_flow_service import CashFlowService as CashFlowHelperService
from services.account_activity_service import AccountActivityService
from services.tag_service import TagService
from services.preferences_service import PreferencesService
import logging
import uuid
from datetime import datetime
from services.date_normalization_service import DateNormalizationService

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

# Initialize preferences service for date normalization
preferences_service = PreferencesService()

def _get_date_normalizer():
    """Resolve timezone and create a DateNormalizationService for cash flows endpoints."""
    timezone_name = DateNormalizationService.resolve_timezone(
        request,
        preferences_service=preferences_service
    )
    return DateNormalizationService(timezone_name)

EXCHANGE_FROM_TYPE = CashFlowHelperService.EXCHANGE_FROM_TYPE
EXCHANGE_TO_TYPE = CashFlowHelperService.EXCHANGE_TO_TYPE
LEGACY_EXCHANGE_FROM_TYPE = CashFlowHelperService.LEGACY_EXCHANGE_FROM_TYPE
LEGACY_EXCHANGE_TO_TYPE = CashFlowHelperService.LEGACY_EXCHANGE_TO_TYPE
ALL_EXCHANGE_TYPES = {
    EXCHANGE_FROM_TYPE,
    EXCHANGE_TO_TYPE,
    LEGACY_EXCHANGE_FROM_TYPE,
    LEGACY_EXCHANGE_TO_TYPE,
}

cash_flows_bp = Blueprint('cash_flows', __name__, url_prefix='/api/cash-flows')

# Create a service class for cash flows
class CashFlowService:
    def __init__(self):
        self.model = CashFlow
    
    def get_all(self, db: Session, filters=None, user_id=None):
        query = db.query(CashFlow).options(
            joinedload(CashFlow.account),
            joinedload(CashFlow.currency)
            # Removed joinedload(CashFlow.trade) - causes errors when Trade model has columns not in DB
            # Trade data will be loaded lazily if needed, or trade_id will be used from to_dict()
        )
        if user_id is not None:
            query = query.filter(CashFlow.user_id == user_id)
        cash_flows = query.all()
        
        # Enhance data with account and currency names
        enhanced_flows = []
        for cf in cash_flows:
            cf_dict = cf.to_dict()
            if cf.account:
                cf_dict['account_name'] = cf.account.name
            if cf.currency:
                cf_dict['currency_symbol'] = cf.currency.symbol
                cf_dict['currency_name'] = cf.currency.name
            enhanced_flows.append(cf_dict)
        
        return enhanced_flows
    
    def get_by_id(self, db: Session, cash_flow_id: int, user_id=None):
        query = db.query(CashFlow).options(
            joinedload(CashFlow.account),
            joinedload(CashFlow.currency)
            # Removed joinedload(CashFlow.trade) - causes errors when Trade model has columns not in DB
            # Trade data will be loaded lazily if needed, or trade_id will be used from to_dict()
        ).filter(CashFlow.id == cash_flow_id)
        if user_id is not None:
            query = query.filter(CashFlow.user_id == user_id)
        return query.first()

# Initialize base API
cash_flow_service = CashFlowService()
base_api = BaseEntityAPI('cash_flows', cash_flow_service, 'cash_flows')

@cash_flows_bp.route('/', methods=['GET'])
@handle_database_session(auto_commit=True, auto_close=True)
def get_cash_flows():
    """Get all cash flows using base API with custom data enhancement and exchange filtering"""
    # Use the session from the decorator (in g.db)
    db: Session = g.db
    response, status_code = base_api.get_all(db)
    
    # Enhance data with additional information and filter currency exchanges
    if response.get('status') == 'success' and response.get('data'):
        def _apply_account_metadata(entry: dict, account_obj):
            account_currency_id = None
            account_currency_symbol = None
            account_currency_name = None
            if account_obj:
                if isinstance(account_obj, dict):
                    account_currency_id = account_obj.get('currency_id')
                    account_currency_symbol = account_obj.get('currency_symbol')
                    account_currency_name = account_obj.get('currency_name')
                    currency_info = account_obj.get('currency')
                    if isinstance(currency_info, dict):
                        account_currency_symbol = currency_info.get('symbol', account_currency_symbol)
                        account_currency_name = currency_info.get('name', account_currency_name)
                else:
                    account_currency_id = getattr(account_obj, 'currency_id', None)
                    currency_info = getattr(account_obj, 'currency', None)
                    if currency_info:
                        account_currency_symbol = getattr(currency_info, 'symbol', None)
                        account_currency_name = getattr(currency_info, 'name', None)

            if account_currency_symbol:
                entry['account_currency_symbol'] = account_currency_symbol
            if account_currency_id is not None:
                entry['account_currency_id'] = account_currency_id
            if account_currency_name:
                entry['account_currency_name'] = account_currency_name

        processed_flows = []
        exchange_pairs = {}
        
        for cf_dict in response['data']:
            # Create a shallow copy so we don't mutate the original dict returned by base API
            cf_entry = dict(cf_dict)
            
            # Add additional fields if they exist
            account_info = cf_entry.pop('account', None)
            if account_info:
                cf_entry['account_name'] = account_info.get('name', '')
                _apply_account_metadata(cf_entry, account_info)
            
            currency_info = cf_entry.pop('currency', None)
            if currency_info:
                cf_entry['currency_symbol'] = currency_info.get('symbol', '')
                cf_entry['currency_name'] = currency_info.get('name', '')
            
            external_id = cf_entry.get('external_id')
            flow_type = cf_entry.get('type')
            is_exchange_flow = CashFlowHelperService.is_currency_exchange(external_id, flow_type)
            if is_exchange_flow:
                exchange_direction = CashFlowHelperService.get_exchange_direction(flow_type)
                if not exchange_direction:
                    try:
                        amount_value = float(cf_entry.get('amount') or 0)
                        exchange_direction = 'from' if amount_value < 0 else 'to'
                    except (TypeError, ValueError):
                        exchange_direction = None

                if external_id:
                    cf_entry['exchange_group_id'] = external_id
                if exchange_direction:
                    cf_entry['exchange_direction'] = exchange_direction
                
                if external_id and exchange_direction:
                    pair = exchange_pairs.setdefault(external_id, {'from': None, 'to': None})
                    if exchange_direction == 'from':
                        pair['from'] = cf_entry
                    elif exchange_direction == 'to':
                        pair['to'] = cf_entry
            processed_flows.append(cf_entry)
        
        # Ensure completeness for each exchange group (fetch missing flows directly from DB if needed)
        db_session = getattr(g, 'db', None)
        if isinstance(db_session, Session):
            processed_by_id = {entry.get('id'): entry for entry in processed_flows if entry.get('id') is not None}
            for exchange_id, pair in exchange_pairs.items():
                if pair.get('from') and pair.get('to'):
                    continue
                try:
                    db_flows = CashFlowHelperService.get_exchange_flows(db_session, exchange_id)
                except Exception:
                    continue
                
                for flow in db_flows:
                    if flow.id in processed_by_id:
                        continue
                    
                    flow_dict = flow.to_dict()
                    flow_entry = dict(flow_dict)
                    
                    if flow.account:
                        flow_entry['account_name'] = flow.account.name
                        _apply_account_metadata(flow_entry, flow.account)
                    if flow.currency:
                        flow_entry['currency_symbol'] = flow.currency.symbol
                        flow_entry['currency_name'] = flow.currency.name
                    
                    flow_entry['exchange_group_id'] = exchange_id
                    flow_entry['exchange_direction'] = CashFlowHelperService.get_exchange_direction(flow.type) or (
                        'from' if float(getattr(flow, 'amount', 0) or 0) < 0 else 'to'
                    )
                    
                    processed_flows.append(flow_entry)
                    processed_by_id[flow.id] = flow_entry
                    
                    group = exchange_pairs.setdefault(exchange_id, {'from': None, 'to': None})
                    if flow_entry['exchange_direction'] == 'from':
                        group['from'] = flow_entry
                    else:
                        group['to'] = flow_entry
        
        # Enrich exchange flows with linkage details
        # Note: Dates are already normalized by base_api.get_all, so we can use them directly
        for exchange_id, pair in exchange_pairs.items():
            from_flow = pair.get('from')
            to_flow = pair.get('to')
            if from_flow and to_flow:
                from_flow['linked_exchange_cash_flow_id'] = to_flow.get('id')
                to_flow['linked_exchange_cash_flow_id'] = from_flow.get('id')
                
                # Dates are already normalized by base_api.get_all (DateEnvelope format)
                # Use dates directly - they should already be DateEnvelope dicts
                to_flow_date = to_flow.get('date')
                from_flow_date = from_flow.get('date')
                
                from_flow['linked_exchange_summary'] = {
                    "cash_flow_id": to_flow.get('id'),
                    "amount": to_flow.get('amount'),
                    "currency_id": to_flow.get('currency_id'),
                    "currency_symbol": to_flow.get('currency_symbol'),
                    "currency_name": to_flow.get('currency_name'),
                    "usd_rate": to_flow.get('usd_rate'),
                    "date": to_flow_date,
                    "type": to_flow.get('type')
                }
                to_flow['linked_exchange_summary'] = {
                    "cash_flow_id": from_flow.get('id'),
                    "amount": from_flow.get('amount'),
                    "currency_id": from_flow.get('currency_id'),
                    "currency_symbol": from_flow.get('currency_symbol'),
                    "currency_name": from_flow.get('currency_name'),
                    "usd_rate": from_flow.get('usd_rate'),
                    "date": from_flow_date,
                    "type": from_flow.get('type')
                }
                pair_summary = CashFlowHelperService.build_exchange_pair_summary(from_flow, to_flow)
                if pair_summary:
                    from_flow['exchange_pair_summary'] = pair_summary
                    to_flow['exchange_pair_summary'] = pair_summary
            else:
                # If we only have one side, still expose linkage metadata without ID
                if from_flow and not from_flow.get('linked_exchange_cash_flow_id'):
                    from_flow['linked_exchange_cash_flow_id'] = to_flow.get('id') if to_flow else None
                if to_flow and not to_flow.get('linked_exchange_cash_flow_id'):
                    to_flow['linked_exchange_cash_flow_id'] = from_flow.get('id') if from_flow else None
        
        response['data'] = processed_flows
    
    return jsonify(response), status_code

# IMPORTANT: Specific routes (like /delete-imported) must be defined BEFORE parameterized routes (like /<int:cash_flow_id>)
# Otherwise Flask will try to match "delete-imported" as an integer parameter
@cash_flows_bp.route('/delete-imported', methods=['DELETE'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['cash_flows', 'account-activity-*'])
def delete_imported_cash_flows():
    """Delete all cash flows with source='file_import' - Dev utility for testing"""
    try:
        logger.info("=== DELETE IMPORTED CASH FLOWS START ===")
        # Use the session from the decorator (in g.db)
        db: Session = g.db
        
        # Count imported records
        count = db.query(CashFlow).filter(CashFlow.source == 'file_import').count()
        logger.info(f"Found {count} imported cash flows to delete")
        
        if count == 0:
            logger.info("No imported cash flows to delete")
            return jsonify({
                "status": "success",
                "message": "No imported cash flows found. Nothing to delete.",
                "deleted_count": 0,
                "version": "1.0"
            }), 200
        
        # Get details for logging (before deletion)
        cash_flows = db.query(CashFlow).filter(CashFlow.source == 'file_import').all()
        cash_flow_ids = [cf.id for cf in cash_flows]
        logger.info(f"Found {len(cash_flow_ids)} imported cash flows with IDs: {cash_flow_ids[:10] if len(cash_flow_ids) > 10 else cash_flow_ids}...")  # Log first 10 IDs
        
        # Remove tags for imported cash flows (non-blocking - continue even if fails)
        tags_removed = 0
        try:
            # Remove tags for each imported cash flow individually
            for cash_flow_id in cash_flow_ids:
                try:
                    removed = TagService.remove_all_tags_for_entity(db, 'cash_flow', cash_flow_id)
                    tags_removed += removed
                except Exception as tag_error:
                    logger.warning(
                        "Failed to remove tags for cash_flow %s before deletion: %s",
                        cash_flow_id,
                        tag_error
                    )
            if tags_removed > 0:
                logger.info(f"Removed {tags_removed} tag links for imported cash flows")
        except Exception as tag_error:
            logger.warning("Failed to remove tags for imported cash flows before bulk deletion: %s", tag_error)

        # Delete all imported records
        # Note: commit will be done by handle_database_session decorator
        deleted_count = db.query(CashFlow).filter(CashFlow.source == 'file_import').delete()
        logger.info(f"Delete query executed, deleted_count={deleted_count}")
        
        return jsonify({
            "status": "success",
            "message": f"Successfully deleted {deleted_count} imported cash flow(s)",
            "deleted_count": deleted_count,
            "version": "1.0"
        }), 200
    except Exception as e:
        logger.error(f"Error deleting imported cash flows: {str(e)}", exc_info=True)
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to delete imported cash flows: {str(e)}"},
            "version": "1.0"
        }), 500
    # Don't close db here - handle_database_session decorator will do it

@cash_flows_bp.route('/<int:cash_flow_id>', methods=['GET'])
def get_cash_flow(cash_flow_id: int):
    """Get cash flow by ID"""
    try:
        # Get user_id from Flask context (set by auth middleware)
        from flask import g
        user_id = getattr(g, 'user_id', None)
        
        db: Session = next(get_db())
        normalizer = _get_date_normalizer()
        
        # Use service to get cash flow with user_id filtering
        cash_flow = cash_flow_service.get_by_id(db, cash_flow_id, user_id=user_id)
        
        if cash_flow:
            cf_dict = cash_flow.to_dict()
            if cash_flow.account:
                cf_dict['account_name'] = cash_flow.account.name
            if cash_flow.currency:
                cf_dict['currency_symbol'] = cash_flow.currency.symbol
                cf_dict['currency_name'] = cash_flow.currency.name

            external_id = cf_dict.get('external_id')
            if CashFlowHelperService.is_currency_exchange(external_id, cf_dict.get('type')):
                flows = CashFlowHelperService.get_exchange_flows(db, external_id)
                from_flow = next((f for f in flows if CashFlowHelperService.get_exchange_direction(getattr(f, 'type', None)) == 'from'), None)
                to_flow = next((f for f in flows if CashFlowHelperService.get_exchange_direction(getattr(f, 'type', None)) == 'to'), None)
                pair_summary = CashFlowHelperService.build_exchange_pair_summary(from_flow, to_flow)
                if pair_summary:
                    cf_dict['exchange_pair_summary'] = pair_summary
                counterpart = next((f for f in flows if f.id != cash_flow.id), None)
                if counterpart:
                    cf_dict['linked_exchange_cash_flow_id'] = counterpart.id
            
            # Normalize dates to DateEnvelope format
            cf_dict = normalizer.normalize_output(cf_dict)
            
            return jsonify({
                "status": "success",
                "data": cf_dict,
                "message": "Cash flow retrieved successfully",
                "timestamp": normalizer.now_envelope(),
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Cash flow not found"},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error getting cash flow {cash_flow_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve cash flow"},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 500
    # Don't close db here - handle_database_session decorator will do it

@cash_flows_bp.route('/', methods=['POST'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['cash_flows', 'account-activity-*'])
def create_cash_flow():
    """Create new cash flow"""
    try:
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)
        
        logger.info("=== CREATE CASH FLOW START ===")
        data = request.get_json()
        logger.info(f"Received data: {data}")
        # Use the session from the decorator (in g.db)
        db: Session = g.db
        
        # Set user_id if authenticated
        if user_id is not None and 'user_id' not in data:
            data['user_id'] = user_id
        
        # Verify trading_account belongs to user if provided
        if 'trading_account_id' in data and user_id is not None:
            from models.trading_account import TradingAccount
            account = db.query(TradingAccount).filter(
                TradingAccount.id == data['trading_account_id'],
                TradingAccount.user_id == user_id
            ).first()
            if not account:
                return jsonify({
                    "status": "error",
                    "error": {"message": "Trading account not found or does not belong to user"},
                    "version": "1.0"
                }), 404
        
        # Set default values
        if 'currency_id' not in data or data['currency_id'] is None:
            data['currency_id'] = 1  # USD
        if 'usd_rate' not in data:
            data['usd_rate'] = 1.000000
        if 'source' not in data:
            data['source'] = 'manual'
        if 'external_id' not in data:
            data['external_id'] = '0'

        # Normalize fee amount - always store non-negative value in account base currency
        raw_fee_amount = data.get('fee_amount', 0)
        try:
            fee_amount_value = float(raw_fee_amount) if raw_fee_amount not in (None, '') else 0.0
        except (TypeError, ValueError):
            return jsonify({
                "status": "error",
                "error": {"message": "Invalid fee_amount. Fee must be a non-negative number."},
                "version": "1.0"
            }), 400

        if fee_amount_value < 0:
            return jsonify({
                "status": "error",
                "error": {"message": "Fee amount cannot be negative"},
                "version": "1.0"
            }), 400

        data['fee_amount'] = fee_amount_value
        
        # Convert date to date object (accepts YYYY-MM-DD, ISO datetime, DateEnvelope, or datetime)
        if 'date' in data and data['date']:
            try:
                date_input = data['date']
                date_obj = None
                if isinstance(date_input, dict):
                    normalizer = DateNormalizationService()
                    normalized = normalizer.normalize_input_payload({"date": date_input})
                    dt = normalized.get("date") if isinstance(normalized, dict) else None
                    if isinstance(dt, datetime):
                        date_obj = dt.date()
                elif isinstance(date_input, datetime):
                    date_obj = date_input.date()
                elif isinstance(date_input, str):
                    try:
                        date_obj = datetime.strptime(date_input, '%Y-%m-%d').date()
                    except ValueError:
                        try:
                            date_obj = datetime.fromisoformat(date_input.replace('Z', '+00:00')).date()
                        except ValueError:
                            date_obj = None
                if not date_obj:
                    return jsonify({
                        "status": "error",
                        "error": {"message": "Invalid date. Provide YYYY-MM-DD or an ISO datetime/DateEnvelope"},
                        "version": "1.0"
                    }), 400
                data['date'] = date_obj
            except Exception:
                return jsonify({
                    "status": "error",
                    "error": {"message": "Invalid date. Provide YYYY-MM-DD or an ISO datetime/DateEnvelope"},
                    "version": "1.0"
                }), 400
        
        # Sanitize HTML content for description field
        if 'description' in data and data['description']:
            data['description'] = BaseEntityUtils.sanitize_rich_text(data['description'])
        
        # Handle trade_id - convert empty string or 0 to None
        if 'trade_id' in data:
            if data['trade_id'] == '' or data['trade_id'] == 0 or data['trade_id'] == '0':
                data['trade_id'] = None
            elif data['trade_id']:
                try:
                    data['trade_id'] = int(data['trade_id'])
                except (ValueError, TypeError):
                    data['trade_id'] = None
        
        # Validate data against constraints
        logger.info("Validating cash flow data before creation")
        is_valid, errors = ValidationService.validate_data(db, 'cash_flows', data)
        if not is_valid:
            error_message = "; ".join(errors)
            logger.error(f"Cash flow validation failed: {error_message}")
            return jsonify({
                "status": "error",
                "error": {"message": f"Cash flow validation failed: {error_message}"},
                "version": "1.0"
            }), 400
        
        cash_flow = CashFlow(**data)
        db.add(cash_flow)
        # CRITICAL: Must commit here to make data visible to subsequent queries
        db.commit()
        db.refresh(cash_flow)  # Refresh from database to get complete data
        
        # Return data with additional information
        cf_dict = cash_flow.to_dict()
        if cash_flow.account:
            cf_dict['account_name'] = cash_flow.account.name
        if cash_flow.currency:
            cf_dict['currency_symbol'] = cash_flow.currency.symbol
            cf_dict['currency_name'] = cash_flow.currency.name
        
        return jsonify({
            "status": "success",
            "data": cf_dict,
            "message": "Cash flow created successfully",
            "version": "1.0"
        }), 201
    except Exception as e:
        logger.error(f"Error creating cash flow: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    # Don't close db here - handle_database_session decorator will do it

@cash_flows_bp.route('/<int:cash_flow_id>', methods=['PUT'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['cash_flows', 'account-activity-*'])
def update_cash_flow(cash_flow_id: int):
    """Update cash flow"""
    try:
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)
        
        data = request.get_json()
        # Use the session from the decorator (in g.db)
        db: Session = g.db
        
        # Verify cash flow belongs to user
        cash_flow = cash_flow_service.get_by_id(db, cash_flow_id, user_id=user_id)
        
        if cash_flow:
            # Set default values for update
            if 'currency_id' in data and data['currency_id'] is None:
                data['currency_id'] = 1  # USD
            if 'usd_rate' not in data:
                data['usd_rate'] = 1.000000
            if 'source' not in data:
                data['source'] = 'manual'
            if 'external_id' not in data:
                data['external_id'] = '0'

            # Normalize fee amount for updates (default to existing value)
            if 'fee_amount' in data:
                raw_fee_amount = data.get('fee_amount')
                try:
                    fee_amount_value = float(raw_fee_amount) if raw_fee_amount not in (None, '') else 0.0
                except (TypeError, ValueError):
                    return jsonify({
                        "status": "error",
                        "error": {"message": "Invalid fee_amount. Fee must be a non-negative number."},
                        "version": "1.0"
                    }), 400

                if fee_amount_value < 0:
                    return jsonify({
                        "status": "error",
                        "error": {"message": "Fee amount cannot be negative"},
                        "version": "1.0"
                    }), 400

                data['fee_amount'] = fee_amount_value
            else:
                data['fee_amount'] = cash_flow.fee_amount if cash_flow.fee_amount is not None else 0.0
            
            # Convert date to date object (accepts YYYY-MM-DD, ISO datetime, DateEnvelope, or datetime)
            if 'date' in data and data['date']:
                try:
                    date_input = data['date']
                    date_obj = None
                    if isinstance(date_input, dict):
                        normalizer = DateNormalizationService()
                        normalized = normalizer.normalize_input_payload({"date": date_input})
                        dt = normalized.get("date") if isinstance(normalized, dict) else None
                        if isinstance(dt, datetime):
                            date_obj = dt.date()
                    elif isinstance(date_input, datetime):
                        date_obj = date_input.date()
                    elif isinstance(date_input, str):
                        try:
                            date_obj = datetime.strptime(date_input, '%Y-%m-%d').date()
                        except ValueError:
                            try:
                                date_obj = datetime.fromisoformat(date_input.replace('Z', '+00:00')).date()
                            except ValueError:
                                date_obj = None
                    if not date_obj:
                        return jsonify({
                            "status": "error",
                            "error": {"message": "Invalid date. Provide YYYY-MM-DD or an ISO datetime/DateEnvelope"},
                            "version": "1.0"
                        }), 400
                    data['date'] = date_obj
                except Exception:
                    return jsonify({
                        "status": "error",
                        "error": {"message": "Invalid date. Provide YYYY-MM-DD or an ISO datetime/DateEnvelope"},
                        "version": "1.0"
                    }), 400
            
            # Sanitize HTML content for description field
            if 'description' in data and data['description']:
                data['description'] = BaseEntityUtils.sanitize_rich_text(data['description'])
            
            # Handle trade_id - convert empty string or 0 to None
            if 'trade_id' in data:
                if data['trade_id'] == '' or data['trade_id'] == 0 or data['trade_id'] == '0':
                    data['trade_id'] = None
                elif data['trade_id']:
                    try:
                        data['trade_id'] = int(data['trade_id'])
                    except (ValueError, TypeError):
                        data['trade_id'] = None
            
            # Validate data against constraints
            logger.info("Validating cash flow data before update")
            is_valid, errors = ValidationService.validate_data(db, 'cash_flows', data, exclude_id=cash_flow_id)
            if not is_valid:
                error_message = "; ".join(errors)
                logger.error(f"Cash flow validation failed: {error_message}")
                return jsonify({
                    "status": "error",
                    "error": {"message": f"Cash flow validation failed: {error_message}"},
                    "version": "1.0"
                }), 400
            
            for key, value in data.items():
                if hasattr(cash_flow, key):
                    setattr(cash_flow, key, value)
            
            # CRITICAL: Must commit here to make data visible to subsequent queries
            db.commit()
            db.refresh(cash_flow)  # Refresh from database to get complete data
            
            # Return data with additional information
            cf_dict = cash_flow.to_dict()
            if cash_flow.account:
                cf_dict['account_name'] = cash_flow.account.name
            if cash_flow.currency:
                cf_dict['currency_symbol'] = cash_flow.currency.symbol
                cf_dict['currency_name'] = cash_flow.currency.name
            
            return jsonify({
                "status": "success",
                "data": cf_dict,
                "message": "Cash flow updated successfully",
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Cash flow not found"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error updating cash flow {cash_flow_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to update cash flow"},
            "version": "1.0"
        }), 500
    # Don't close db here - handle_database_session decorator will do it

@cash_flows_bp.route('/<int:cash_flow_id>', methods=['DELETE'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['cash_flows', 'account-activity-*'])
def delete_cash_flow(cash_flow_id: int):
    """Delete cash flow"""
    try:
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)
        
        # Use the session from the decorator (in g.db)
        db: Session = g.db
        
        # Verify cash flow belongs to user
        cash_flow = cash_flow_service.get_by_id(db, cash_flow_id, user_id=user_id)
        
        if cash_flow:
            # Tag cleanup is handled automatically by SQLAlchemy event listeners
            db.delete(cash_flow)
            # CRITICAL: Must commit here to make deletion visible to subsequent queries
            db.commit()
            return jsonify({
                "status": "success",
                "message": "Cash flow deleted successfully",
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Cash flow not found"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error deleting cash flow {cash_flow_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to delete cash flow"},
            "version": "1.0"
        }), 500
    # Don't close db here - handle_database_session decorator will do it

@cash_flows_bp.route('/delete-all', methods=['DELETE'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['cash_flows'])
def delete_all_cash_flows():
    """Delete all cash flows - Admin/dev utility"""
    try:
        logger.info("=== DELETE ALL CASH FLOWS START ===")
        # Use the session from the decorator (in g.db)
        db: Session = g.db
        
        # Count existing records
        count = db.query(CashFlow).count()
        logger.info(f"Found {count} cash flows to delete")
        
        if count == 0:
            logger.info("No cash flows to delete")
            return jsonify({
                "status": "success",
                "message": "No cash flows to delete - table is already empty",
                "deleted_count": 0,
                "version": "1.0"
            }), 200
        
        try:
            TagService.remove_all_tags_for_type(db, 'cash_flow')
        except ValueError as tag_error:
            logger.warning("Failed to remove tags for all cash_flows before bulk deletion: %s", tag_error)

        # Delete all records
        deleted_count = db.query(CashFlow).delete()
        # CRITICAL: Must commit here to make deletion visible to subsequent queries
        db.commit()
        
        logger.info(f"Successfully deleted {deleted_count} cash flows")
        
        return jsonify({
            "status": "success",
            "message": f"Successfully deleted {deleted_count} cash flows",
            "deleted_count": deleted_count,
            "version": "1.0"
        }), 200
    except Exception as e:
        logger.error(f"Error deleting all cash flows: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to delete all cash flows"},
            "version": "1.0"
        }), 500
    # Don't close db here - handle_database_session decorator will do it

# ===== Currency Exchange Endpoints =====

@cash_flows_bp.route('/exchange', methods=['POST'])
@handle_database_session(auto_commit=False, auto_close=True)
@invalidate_cache(['cash_flows', 'account-activity-*'])
def create_currency_exchange():
    """
    Create a currency exchange operation (atomic creation of two cash flows)
    
    Creates:
    - From flow: type='currency_exchange_from', amount=-from_amount, currency_id=from_currency_id, stores fee_amount
    - To flow: type='currency_exchange_to', amount=+to_amount, currency_id=to_currency_id
    
    All flows share the same external_id: 'exchange_<uuid>'
    """
    try:
        logger.info("=== CREATE CURRENCY EXCHANGE START ===")
        data = request.get_json()
        logger.info(f"Received exchange data: {data}")
        
        db: Session = g.db
        
        # Validate required fields
        required_fields = ['trading_account_id', 'from_currency_id', 'to_currency_id', 
                          'from_amount', 'exchange_rate', 'date']
        for field in required_fields:
            if field not in data or data[field] is None:
                return jsonify({
                    "status": "error",
                    "error": {"message": f"Field '{field}' is required"},
                    "version": "1.0"
                }), 400
        
        # Extract and validate data
        trading_account_id = int(data['trading_account_id'])
        from_currency_id = int(data['from_currency_id'])
        to_currency_id = int(data['to_currency_id'])
        from_amount = float(data['from_amount'])
        exchange_rate = float(data['exchange_rate'])
        fee_amount = float(data.get('fee_amount', 0)) if data.get('fee_amount') else 0
        fee_currency_id = data.get('fee_currency_id')
        date_str = data['date']
        description = data.get('description', '')
        source_value = data.get('source', 'manual')
        
        # Validate currencies are different
        if from_currency_id == to_currency_id:
            return jsonify({
                "status": "error",
                "error": {"message": "From and to currencies must be different"},
                "version": "1.0"
            }), 400
        
        # Validate amounts
        if from_amount <= 0:
            return jsonify({
                "status": "error",
                "error": {"message": "From amount must be greater than 0"},
                "version": "1.0"
            }), 400
        
        if exchange_rate <= 0:
            return jsonify({
                "status": "error",
                "error": {"message": "Exchange rate must be greater than 0"},
                "version": "1.0"
            }), 400
        
        if fee_amount < 0:
            return jsonify({
                "status": "error",
                "error": {"message": "Fee amount cannot be negative"},
                "version": "1.0"
            }), 400

        if fee_amount < 0:
            return jsonify({
                "status": "error",
                "error": {"message": "Fee amount cannot be negative"},
                "version": "1.0"
            }), 400
        
        # Validate trading account and fee currency alignment
        account = db.query(TradingAccount).filter(TradingAccount.id == trading_account_id).first()
        if not account:
            return jsonify({
                "status": "error",
                "error": {"message": "Trading account not found"},
                "version": "1.0"
            }), 404

        account_currency_id = account.currency_id
        if not account_currency_id:
            return jsonify({
                "status": "error",
                "error": {"message": "Trading account base currency is missing"},
                "version": "1.0"
            }), 400

        if fee_currency_id:
            fee_currency_id = int(fee_currency_id)
        else:
            fee_currency_id = account_currency_id

        if fee_currency_id != account_currency_id:
            return jsonify({
                "status": "error",
                "error": {"message": "Fee currency must match trading account base currency"},
                "version": "1.0"
            }), 400

        # Convert date (accepts YYYY-MM-DD, ISO datetime, DateEnvelope, or datetime)
        date_obj = None
        try:
            if isinstance(date_str, dict):
                normalizer = DateNormalizationService()
                normalized = normalizer.normalize_input_payload({"date": date_str})
                dt = normalized.get("date") if isinstance(normalized, dict) else None
                if isinstance(dt, datetime):
                    date_obj = dt.date()
            elif isinstance(date_str, datetime):
                date_obj = date_str.date()
            elif isinstance(date_str, str):
                # Try date-only first
                try:
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
                except ValueError:
                    # Try ISO datetime
                    try:
                        date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00')).date()
                    except ValueError:
                        date_obj = None
        except Exception:
            date_obj = None
        if not date_obj:
            return jsonify({
                "status": "error",
                "error": {"message": "Invalid date. Provide YYYY-MM-DD or an ISO datetime/DateEnvelope"},
                "version": "1.0"
            }), 400
        
        # Calculate to_amount
        to_amount = from_amount * exchange_rate
        
        # Get currency objects for usd_rate
        from_currency = db.query(Currency).filter(Currency.id == from_currency_id).first()
        to_currency = db.query(Currency).filter(Currency.id == to_currency_id).first()
        
        if not from_currency or not to_currency:
            return jsonify({
                "status": "error",
                "error": {"message": "Currency not found"},
                "version": "1.0"
            }), 404
        
        # Create via service (SSOT)
        try:
            svc_result = CashFlowHelperService.create_exchange(
                db,
                trading_account_id=trading_account_id,
                from_currency_id=from_currency_id,
                to_currency_id=to_currency_id,
                date=date_obj,
                from_amount=from_amount,
                exchange_rate=exchange_rate,
                fee_amount=fee_amount,
                description=description,
                source=source_value
            )
            from_flow = svc_result["from_flow"]
            to_flow = svc_result["to_flow"]
            exchange_id = svc_result["exchange_id"]
            exchange_uuid = CashFlowHelperService.get_exchange_uuid_from_external_id(exchange_id)

            result = {
                "exchange_id": exchange_uuid,
                "exchange_external_id": exchange_id,
                "from_flow": from_flow.to_dict(),
                "to_flow": to_flow.to_dict(),
                "fee_amount": fee_amount,
                "fee_currency_id": fee_currency_id
            }
            pair_summary = CashFlowHelperService.build_exchange_pair_summary(from_flow, to_flow)
            if pair_summary:
                result["exchange_pair_summary"] = pair_summary

            logger.info(f"✅ Currency exchange created successfully: {exchange_id}")

            return jsonify({
                "status": "success",
                "data": result,
                "message": "Currency exchange created successfully",
                "version": "1.0"
            }), 201
        except Exception as e:
            logger.error(f"Error creating currency exchange: {str(e)}")
            return jsonify({
                "status": "error",
                "error": {"message": str(e)},
                "version": "1.0"
            }), 400
            
    except Exception as e:
        logger.error(f"Error in create_currency_exchange: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400

@cash_flows_bp.route('/exchange/<exchange_uuid>', methods=['GET'])
@handle_database_session(auto_commit=True, auto_close=True)
def get_currency_exchange(exchange_uuid: str):
    """Get currency exchange details by UUID"""
    try:
        db: Session = g.db
        exchange_id = CashFlowHelperService.create_exchange_id(exchange_uuid)
        
        flows = CashFlowHelperService.get_exchange_flows(db, exchange_id)
        
        if not flows:
            return jsonify({
                "status": "error",
                "error": {"message": "Currency exchange not found"},
                "version": "1.0"
            }), 404
        
        # Validate completeness
        is_valid, error_msg = CashFlowHelperService.validate_exchange_completeness(flows)
        if not is_valid:
            return jsonify({
                "status": "error",
                "error": {"message": f"Invalid exchange structure: {error_msg}"},
                "version": "1.0"
            }), 400
        
        # Separate flows by type
        from_flow = next((f for f in flows if CashFlowHelperService.get_exchange_direction(getattr(f, 'type', None)) == 'from'), None)
        to_flow = next((f for f in flows if CashFlowHelperService.get_exchange_direction(getattr(f, 'type', None)) == 'to'), None)
        
        # Calculate exchange rate from amounts
        exchange_rate = abs(to_flow.amount / from_flow.amount) if from_flow and to_flow else 0
        fee_amount = from_flow.fee_amount if from_flow else 0
        fee_currency_id = from_flow.account.currency_id if from_flow and from_flow.account else None
        
        result = {
            "exchange_id": exchange_uuid,
            "exchange_external_id": exchange_id,
            "exchange_rate": exchange_rate,
            "from_flow": from_flow.to_dict() if from_flow else None,
            "to_flow": to_flow.to_dict() if to_flow else None,
            "fee_amount": fee_amount,
            "fee_currency_id": fee_currency_id
        }
        pair_summary = CashFlowHelperService.build_exchange_pair_summary(from_flow, to_flow)
        if pair_summary:
            result["exchange_pair_summary"] = pair_summary
        
        return jsonify({
            "status": "success",
            "data": result,
            "message": "Currency exchange retrieved successfully",
            "version": "1.0"
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting currency exchange {exchange_uuid}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve currency exchange"},
            "version": "1.0"
        }), 500

@cash_flows_bp.route('/exchange/<exchange_uuid>', methods=['PUT'])
@handle_database_session(auto_commit=False, auto_close=True)
@invalidate_cache(['cash_flows', 'account-activity-*'])
def update_currency_exchange(exchange_uuid: str):
    """Update currency exchange operation (atomic update of all related flows)"""
    try:
        logger.info(f"=== UPDATE CURRENCY EXCHANGE START: {exchange_uuid} ===")
        data = request.get_json()
        logger.info(f"Received update data: {data}")
        
        db: Session = g.db
        exchange_id = CashFlowHelperService.create_exchange_id(exchange_uuid)
        
        # Get existing flows
        flows = CashFlowHelperService.get_exchange_flows(db, exchange_id)
        
        if not flows:
            return jsonify({
                "status": "error",
                "error": {"message": "Currency exchange not found"},
                "version": "1.0"
            }), 404
        
        # Validate completeness
        is_valid, error_msg = CashFlowHelperService.validate_exchange_completeness(flows)
        if not is_valid:
            return jsonify({
                "status": "error",
                "error": {"message": f"Invalid exchange structure: {error_msg}"},
                "version": "1.0"
            }), 400
        
        # Separate existing flows
        from_flow = next((f for f in flows if CashFlowHelperService.get_exchange_direction(getattr(f, 'type', None)) == 'from'), None)
        to_flow = next((f for f in flows if CashFlowHelperService.get_exchange_direction(getattr(f, 'type', None)) == 'to'), None)
        # Validate required fields
        required_fields = ['trading_account_id', 'from_currency_id', 'to_currency_id',
                          'from_amount', 'exchange_rate', 'date']
        for field in required_fields:
            if field not in data or data[field] is None:
                return jsonify({
                    "status": "error",
                    "error": {"message": f"Field '{field}' is required"},
                    "version": "1.0"
                }), 400
        
        # Extract data
        trading_account_id = int(data['trading_account_id'])
        from_currency_id = int(data['from_currency_id'])
        to_currency_id = int(data['to_currency_id'])
        from_amount = float(data['from_amount'])
        exchange_rate = float(data['exchange_rate'])
        fee_amount = float(data.get('fee_amount', 0)) if data.get('fee_amount') else 0
        fee_currency_id = data.get('fee_currency_id')
        date_str = data['date']
        description = data.get('description', '')
        
        # Validate
        if from_currency_id == to_currency_id:
            return jsonify({
                "status": "error",
                "error": {"message": "From and to currencies must be different"},
                "version": "1.0"
            }), 400
        
        if from_amount <= 0:
            return jsonify({
                "status": "error",
                "error": {"message": "From amount must be greater than 0"},
                "version": "1.0"
            }), 400

        if exchange_rate <= 0:
            return jsonify({
                "status": "error",
                "error": {"message": "Exchange rate must be greater than 0"},
                "version": "1.0"
            }), 400

        if fee_amount < 0:
            return jsonify({
                "status": "error",
                "error": {"message": "Fee amount cannot be negative"},
                "version": "1.0"
            }), 400
        
        account = db.query(TradingAccount).filter(TradingAccount.id == trading_account_id).first()
        if not account:
            return jsonify({
                "status": "error",
                "error": {"message": "Trading account not found"},
                "version": "1.0"
            }), 404

        account_currency_id = account.currency_id
        if not account_currency_id:
            return jsonify({
                "status": "error",
                "error": {"message": "Trading account base currency is missing"},
                "version": "1.0"
            }), 400

        if fee_currency_id:
            fee_currency_id = int(fee_currency_id)
        else:
            fee_currency_id = account_currency_id

        if fee_currency_id != account_currency_id:
            return jsonify({
                "status": "error",
                "error": {"message": "Fee currency must match trading account base currency"},
                "version": "1.0"
            }), 400

        # Convert date (accepts YYYY-MM-DD, ISO datetime, DateEnvelope, or datetime)
        date_obj = None
        try:
            if isinstance(date_str, dict):
                normalizer = DateNormalizationService()
                normalized = normalizer.normalize_input_payload({"date": date_str})
                dt = normalized.get("date") if isinstance(normalized, dict) else None
                if isinstance(dt, datetime):
                    date_obj = dt.date()
            elif isinstance(date_str, datetime):
                date_obj = date_str.date()
            elif isinstance(date_str, str):
                # Try date-only first
                try:
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
                except ValueError:
                    # Try ISO datetime
                    try:
                        date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00')).date()
                    except ValueError:
                        date_obj = None
        except Exception:
            date_obj = None
        if not date_obj:
            return jsonify({
                "status": "error",
                "error": {"message": "Invalid date. Provide YYYY-MM-DD or an ISO datetime/DateEnvelope"},
                "version": "1.0"
            }), 400
        
        # Check balance if amount increased
        old_from_amount = abs(from_flow.amount) if from_flow else 0
        old_fee_amount = from_flow.fee_amount if from_flow and from_flow.fee_amount else 0
        if from_amount + fee_amount > old_from_amount + old_fee_amount:
            current_balance = AccountActivityService.calculate_balance_by_currency(
                db, trading_account_id, from_currency_id
            )
            required_amount = from_amount + fee_amount
            if current_balance < required_amount:
                return jsonify({
                    "status": "error",
                    "error": {"message": f"Insufficient balance. Required: {required_amount}, Available: {current_balance}"},
                    "version": "1.0"
                }), 400
        
        # Calculate to_amount
        to_amount = from_amount * exchange_rate
        
        # Get currencies
        from_currency = db.query(Currency).filter(Currency.id == from_currency_id).first()
        to_currency = db.query(Currency).filter(Currency.id == to_currency_id).first()
        
        if not from_currency or not to_currency:
            return jsonify({
                "status": "error",
                "error": {"message": "Currency not found"},
                "version": "1.0"
            }), 404
        
        try:
            # Update from flow
            if from_flow:
                from_flow.trading_account_id = trading_account_id
                from_flow.type = EXCHANGE_FROM_TYPE
                from_flow.amount = -from_amount
                from_flow.fee_amount = fee_amount
                from_flow.currency_id = from_currency_id
                from_flow.usd_rate = float(from_currency.usd_rate)
                from_flow.date = date_obj
                from_flow.description = description
            
            # Update to flow
            if to_flow:
                to_flow.trading_account_id = trading_account_id
                to_flow.type = EXCHANGE_TO_TYPE
                to_flow.amount = to_amount
                to_flow.fee_amount = 0.0
                to_flow.currency_id = to_currency_id
                to_flow.usd_rate = float(to_currency.usd_rate)
                to_flow.date = date_obj
                to_flow.description = description
            
            # Commit transaction
            db.commit()
            
            # Refresh flows
            if from_flow:
                db.refresh(from_flow)
            if to_flow:
                db.refresh(to_flow)
            
            # Get updated flows
            updated_flows = CashFlowHelperService.get_exchange_flows(db, exchange_id)
            updated_from_flow = next((f for f in updated_flows if CashFlowHelperService.get_exchange_direction(getattr(f, 'type', None)) == 'from'), None)
            updated_to_flow = next((f for f in updated_flows if CashFlowHelperService.get_exchange_direction(getattr(f, 'type', None)) == 'to'), None)
            
            result = {
                "exchange_id": exchange_uuid,
                "exchange_external_id": exchange_id,
                "from_flow": updated_from_flow.to_dict() if updated_from_flow else None,
                "to_flow": updated_to_flow.to_dict() if updated_to_flow else None,
                "fee_amount": fee_amount,
                "fee_currency_id": fee_currency_id
            }
            pair_summary = CashFlowHelperService.build_exchange_pair_summary(updated_from_flow, updated_to_flow)
            if pair_summary:
                result["exchange_pair_summary"] = pair_summary
            
            logger.info(f"✅ Currency exchange updated successfully: {exchange_id}")
            
            return jsonify({
                "status": "success",
                "data": result,
                "message": "Currency exchange updated successfully",
                "version": "1.0"
            }), 200
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating currency exchange: {str(e)}")
            raise
            
    except Exception as e:
        logger.error(f"Error in update_currency_exchange: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400

@cash_flows_bp.route('/exchange/<exchange_uuid>', methods=['DELETE'])
@handle_database_session(auto_commit=False, auto_close=True)
@invalidate_cache(['cash_flows', 'account-activity-*'])
def delete_currency_exchange(exchange_uuid: str):
    """Delete currency exchange operation (atomic deletion of all related flows)"""
    try:
        logger.info(f"=== DELETE CURRENCY EXCHANGE START: {exchange_uuid} ===")
        
        db: Session = g.db
        exchange_id = CashFlowHelperService.create_exchange_id(exchange_uuid)
        
        # Get existing flows
        flows = CashFlowHelperService.get_exchange_flows(db, exchange_id)
        
        if not flows:
            return jsonify({
                "status": "error",
                "error": {"message": "Currency exchange not found"},
                "version": "1.0"
            }), 404
        
        # Validate completeness
        is_valid, error_msg = CashFlowHelperService.validate_exchange_completeness(flows)
        if not is_valid:
            return jsonify({
                "status": "error",
                "error": {"message": f"Invalid exchange structure: {error_msg}"},
                "version": "1.0"
            }), 400
        
        try:
            # Delete all flows
            for flow in flows:
                db.delete(flow)
            
            # Commit transaction
            db.commit()
            
            logger.info(f"✅ Currency exchange deleted successfully: {exchange_id} ({len(flows)} flows)")
            
            return jsonify({
                "status": "success",
                "message": f"Currency exchange deleted successfully ({len(flows)} flows removed)",
                "version": "1.0"
            }), 200
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting currency exchange: {str(e)}")
            raise
            
    except Exception as e:
        logger.error(f"Error in delete_currency_exchange: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to delete currency exchange"},
            "version": "1.0"
        }), 500
