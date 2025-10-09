from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session, joinedload
from config.database import get_db
from models.cash_flow import CashFlow
from models.currency import Currency
from services.validation_service import ValidationService
from services.advanced_cache_service import cache_for, invalidate_cache
import logging

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

cash_flows_bp = Blueprint('cash_flows', __name__, url_prefix='/api/cash_flows')

# Create a service class for cash flows
class CashFlowService:
    def __init__(self):
        self.model = CashFlow
    
    def get_all(self, db: Session, filters=None):
        return db.query(CashFlow).options(
            joinedload(CashFlow.account),
            joinedload(CashFlow.currency)
        ).all()
    
    def get_by_id(self, db: Session, cash_flow_id: int):
        return db.query(CashFlow).options(
            joinedload(CashFlow.account),
            joinedload(CashFlow.currency)
        ).filter(CashFlow.id == cash_flow_id).first()

# Initialize base API
cash_flow_service = CashFlowService()
base_api = BaseEntityAPI('cash_flows', cash_flow_service, 'cash_flows')

@cash_flows_bp.route('/', methods=['GET'])
@api_endpoint(cache_ttl=60, rate_limit=60)
@handle_database_session()
def get_cash_flows():
    """Get all cash flows with enhanced account and currency data"""
    db: Session = g.db
    
    # Use TradingAccountService to get account details (avoiding duplicate code!)
    from services.trading_account_service import TradingAccountService
    
    # Get cash flows with joined relationships
    cash_flows = db.query(CashFlow).options(
        joinedload(CashFlow.account),
        joinedload(CashFlow.currency)
    ).all()
    
    enhanced_data = []
    for cf in cash_flows:
        cf_dict = cf.to_dict()
        
        # Get full account details using the service
        if cf.trading_account_id:
            account = TradingAccountService.get_by_id(db, cf.trading_account_id)
            if account:
                cf_dict['account'] = {
                    'id': account.id,
                    'name': account.name,
                    'type': account.type if hasattr(account, 'type') else None,
                    'status': account.status if hasattr(account, 'status') else None,
                    'balance': float(account.cash_balance) if hasattr(account, 'cash_balance') and account.cash_balance is not None else None
                }
                cf_dict['account_name'] = account.name
        
        # Add currency details
        if cf.currency:
            cf_dict['currency_symbol'] = cf.currency.symbol
            cf_dict['currency_name'] = cf.currency.name
        
        enhanced_data.append(cf_dict)
    
    return jsonify({
        "status": "success",
        "data": enhanced_data,
        "message": f"Retrieved {len(enhanced_data)} cash flows",
        "version": "1.0"
    }), 200

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
    finally:
        db.close()

@cash_flows_bp.route('/', methods=['POST'])
@invalidate_cache(['cash_flows'])
def create_cash_flow():
    """Create new cash flow"""
    try:
        logger.info("=== CREATE CASH FLOW START ===")
        data = request.get_json()
        logger.info(f"Received data: {data}")
        db: Session = next(get_db())
        
        # Set default values
        if 'currency_id' not in data or data['currency_id'] is None:
            data['currency_id'] = 1  # USD
        if 'usd_rate' not in data:
            data['usd_rate'] = 1.000000
        if 'source' not in data:
            data['source'] = 'manual'
        if 'external_id' not in data:
            data['external_id'] = '0'
        
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
        db.commit()
        db.refresh(cash_flow)
        
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
    finally:
        db.close()

@cash_flows_bp.route('/<int:cash_flow_id>', methods=['PUT'])
@invalidate_cache(['cash_flows'])
def update_cash_flow(cash_flow_id: int):
    """Update cash flow"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
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
            
            db.commit()
            db.refresh(cash_flow)
            
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
    finally:
        db.close()

@cash_flows_bp.route('/<int:cash_flow_id>', methods=['DELETE'])
@invalidate_cache(['cash_flows'])
def delete_cash_flow(cash_flow_id: int):
    """Delete cash flow"""
    try:
        db: Session = next(get_db())
        cash_flow = db.query(CashFlow).filter(CashFlow.id == cash_flow_id).first()
        
        if cash_flow:
            db.delete(cash_flow)
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
    finally:
        db.close()
