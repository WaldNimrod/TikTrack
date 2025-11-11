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
import logging
import uuid
from datetime import datetime

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

cash_flows_bp = Blueprint('cash_flows', __name__, url_prefix='/api/cash-flows')

# Create a service class for cash flows
class CashFlowService:
    def __init__(self):
        self.model = CashFlow
    
    def get_all(self, db: Session, filters=None):
        cash_flows = db.query(CashFlow).options(
            joinedload(CashFlow.account),
            joinedload(CashFlow.currency),
            joinedload(CashFlow.trade)
        ).all()
        
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
    
    def get_by_id(self, db: Session, cash_flow_id: int):
        return db.query(CashFlow).options(
            joinedload(CashFlow.account),
            joinedload(CashFlow.currency),
            joinedload(CashFlow.trade)
        ).filter(CashFlow.id == cash_flow_id).first()

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
        processed_flows = []
        exchange_pairs = {}
        
        for cf_dict in response['data']:
            # Create a shallow copy so we don't mutate the original dict returned by base API
            cf_entry = dict(cf_dict)
            
            # Add additional fields if they exist
            account_info = cf_entry.pop('account', None)
            if account_info:
                cf_entry['account_name'] = account_info.get('name', '')
            
            currency_info = cf_entry.pop('currency', None)
            if currency_info:
                cf_entry['currency_symbol'] = currency_info.get('symbol', '')
                cf_entry['currency_name'] = currency_info.get('name', '')
            
            external_id = cf_entry.get('external_id')
            if CashFlowHelperService.is_currency_exchange(external_id):
                cf_entry['exchange_group_id'] = external_id
                cf_entry['exchange_direction'] = 'from' if cf_entry.get('type') == 'other_negative' else 'to'
                
                pair = exchange_pairs.setdefault(external_id, {'from': None, 'to': None})
                if cf_entry.get('type') == 'other_negative':
                    pair['from'] = cf_entry
                elif cf_entry.get('type') == 'other_positive':
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
                    if flow.currency:
                        flow_entry['currency_symbol'] = flow.currency.symbol
                        flow_entry['currency_name'] = flow.currency.name
                    
                    flow_entry['exchange_group_id'] = exchange_id
                    flow_entry['exchange_direction'] = 'from' if flow.type == 'other_negative' else 'to'
                    
                    processed_flows.append(flow_entry)
                    processed_by_id[flow.id] = flow_entry
                    
                    group = exchange_pairs.setdefault(exchange_id, {'from': None, 'to': None})
                    if flow_entry['exchange_direction'] == 'from':
                        group['from'] = flow_entry
                    else:
                        group['to'] = flow_entry
        
        # Enrich exchange flows with linkage details
        for exchange_id, pair in exchange_pairs.items():
            from_flow = pair.get('from')
            to_flow = pair.get('to')
            if from_flow and to_flow:
                from_flow['linked_exchange_cash_flow_id'] = to_flow.get('id')
                to_flow['linked_exchange_cash_flow_id'] = from_flow.get('id')
                
                from_flow['linked_exchange_summary'] = {
                    "cash_flow_id": to_flow.get('id'),
                    "amount": to_flow.get('amount'),
                    "currency_id": to_flow.get('currency_id'),
                    "currency_symbol": to_flow.get('currency_symbol'),
                    "currency_name": to_flow.get('currency_name'),
                    "usd_rate": to_flow.get('usd_rate'),
                    "date": to_flow.get('date'),
                    "type": to_flow.get('type')
                }
                to_flow['linked_exchange_summary'] = {
                    "cash_flow_id": from_flow.get('id'),
                    "amount": from_flow.get('amount'),
                    "currency_id": from_flow.get('currency_id'),
                    "currency_symbol": from_flow.get('currency_symbol'),
                    "currency_name": from_flow.get('currency_name'),
                    "usd_rate": from_flow.get('usd_rate'),
                    "date": from_flow.get('date'),
                    "type": from_flow.get('type')
                }
            else:
                # If we only have one side, still expose linkage metadata without ID
                if from_flow and not from_flow.get('linked_exchange_cash_flow_id'):
                    from_flow['linked_exchange_cash_flow_id'] = to_flow.get('id') if to_flow else None
                if to_flow and not to_flow.get('linked_exchange_cash_flow_id'):
                    to_flow['linked_exchange_cash_flow_id'] = from_flow.get('id') if from_flow else None
        
        response['data'] = processed_flows
    
    return jsonify(response), status_code

@cash_flows_bp.route('/<int:cash_flow_id>', methods=['GET'])
def get_cash_flow(cash_flow_id: int):
    """Get cash flow by ID"""
    try:
        db: Session = next(get_db())
        cash_flow = db.query(CashFlow).options(
            joinedload(CashFlow.account),
            joinedload(CashFlow.currency)
        ).filter(CashFlow.id == cash_flow_id).first()
        
        if cash_flow:
            cf_dict = cash_flow.to_dict()
            if cash_flow.account:
                cf_dict['account_name'] = cash_flow.account.name
            if cash_flow.currency:
                cf_dict['currency_symbol'] = cash_flow.currency.symbol
                cf_dict['currency_name'] = cash_flow.currency.name
            
            return jsonify({
                "status": "success",
                "data": cf_dict,
                "message": "Cash flow retrieved successfully",
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Cash flow not found"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error getting cash flow {cash_flow_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve cash flow"},
            "version": "1.0"
        }), 500
    # Don't close db here - handle_database_session decorator will do it

@cash_flows_bp.route('/', methods=['POST'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['cash_flows', 'account-activity-*'])
def create_cash_flow():
    """Create new cash flow"""
    try:
        logger.info("=== CREATE CASH FLOW START ===")
        data = request.get_json()
        logger.info(f"Received data: {data}")
        # Use the session from the decorator (in g.db)
        db: Session = g.db
        
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
        
        # Convert date string to date object
        if 'date' in data and data['date']:
            from datetime import datetime
            try:
                logger.info(f"Converting date string: {data['date']}")
                data['date'] = datetime.strptime(data['date'], '%Y-%m-%d').date()
                logger.info(f"Converted to date object: {data['date']}")
            except ValueError:
                return jsonify({
                    "status": "error",
                    "error": {"message": "Invalid date format. Use YYYY-MM-DD"},
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
        data = request.get_json()
        # Use the session from the decorator (in g.db)
        db: Session = g.db
        cash_flow = db.query(CashFlow).filter(CashFlow.id == cash_flow_id).first()
        
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
            
            # Convert date string to date object
            if 'date' in data and data['date']:
                from datetime import datetime
                try:
                    logger.info(f"Converting date string: {data['date']}")
                    data['date'] = datetime.strptime(data['date'], '%Y-%m-%d').date()
                    logger.info(f"Converted to date object: {data['date']}")
                except ValueError:
                    return jsonify({
                        "status": "error",
                        "error": {"message": "Invalid date format. Use YYYY-MM-DD"},
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
        # Use the session from the decorator (in g.db)
        db: Session = g.db
        cash_flow = db.query(CashFlow).filter(CashFlow.id == cash_flow_id).first()
        
        if cash_flow:
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
    - From flow: type='other_negative', amount=-from_amount, currency_id=from_currency_id, stores fee_amount
    - To flow: type='other_positive', amount=+to_amount, currency_id=to_currency_id
    
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

        # Convert date
        try:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                "status": "error",
                "error": {"message": "Invalid date format. Use YYYY-MM-DD"},
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
        
        # Create exchange UUID
        exchange_uuid = uuid.uuid4().hex[:12]
        exchange_id = CashFlowHelperService.create_exchange_id(exchange_uuid)
        
        # Create cash flows within transaction
        try:
            # From flow (negative - outgoing)
            from_flow = CashFlow(
                trading_account_id=trading_account_id,
                type='other_negative',
                amount=-from_amount,
                fee_amount=fee_amount,
                currency_id=from_currency_id,
                usd_rate=float(from_currency.usd_rate),
                date=date_obj,
                description=description,
                source=source_value,
                external_id=exchange_id
            )
            db.add(from_flow)
            
            # To flow (positive - incoming)
            to_flow = CashFlow(
                trading_account_id=trading_account_id,
                type='other_positive',
                amount=to_amount,
                fee_amount=0.0,
                currency_id=to_currency_id,
                usd_rate=float(to_currency.usd_rate),
                date=date_obj,
                description=description,
                source=source_value,
                external_id=exchange_id
            )
            db.add(to_flow)
            
            # Commit transaction
            db.commit()
            
            # Refresh to get IDs
            db.refresh(from_flow)
            db.refresh(to_flow)
            
            # Return response
            result = {
                "exchange_id": exchange_uuid,
                "exchange_external_id": exchange_id,
                "from_flow": from_flow.to_dict(),
                "to_flow": to_flow.to_dict(),
                "fee_amount": fee_amount,
                "fee_currency_id": fee_currency_id
            }
            
            logger.info(f"✅ Currency exchange created successfully: {exchange_id}")
            
            return jsonify({
                "status": "success",
                "data": result,
                "message": "Currency exchange created successfully",
                "version": "1.0"
            }), 201
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating currency exchange: {str(e)}")
            raise
            
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
        from_flow = next((f for f in flows if f.type == 'other_negative'), None)
        to_flow = next((f for f in flows if f.type == 'other_positive'), None)
        
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
        from_flow = next((f for f in flows if f.type == 'other_negative'), None)
        to_flow = next((f for f in flows if f.type == 'other_positive'), None)
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

        # Convert date
        try:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                "status": "error",
                "error": {"message": "Invalid date format. Use YYYY-MM-DD"},
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
                from_flow.amount = -from_amount
                from_flow.fee_amount = fee_amount
                from_flow.currency_id = from_currency_id
                from_flow.usd_rate = float(from_currency.usd_rate)
                from_flow.date = date_obj
                from_flow.description = description
            
            # Update to flow
            if to_flow:
                to_flow.trading_account_id = trading_account_id
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
            updated_from_flow = next((f for f in updated_flows if f.type == 'other_negative'), None)
            updated_to_flow = next((f for f in updated_flows if f.type == 'other_positive'), None)
            
            result = {
                "exchange_id": exchange_uuid,
                "exchange_external_id": exchange_id,
                "from_flow": updated_from_flow.to_dict() if updated_from_flow else None,
                "to_flow": updated_to_flow.to_dict() if updated_to_flow else None,
                "fee_amount": fee_amount,
                "fee_currency_id": fee_currency_id
            }
            
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
