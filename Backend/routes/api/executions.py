from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session, joinedload
from config.database import get_db
from models.execution import Execution
from services.validation_service import ValidationService
from services.advanced_cache_service import cache_for, cache_with_deps, invalidate_cache
import logging

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

executions_bp = Blueprint('executions', __name__, url_prefix='/api/executions')

# Create a simple service class for executions
class ExecutionService:
    def __init__(self):
        self.model = Execution
    
    def get_all(self, db: Session, filters=None):
        return db.query(Execution).options(
            joinedload(Execution.trading_account),
            joinedload(Execution.ticker),
            joinedload(Execution.trade)
        ).all()
    
    def get_by_id(self, db: Session, execution_id: int):
        return db.query(Execution).options(
            joinedload(Execution.trading_account),
            joinedload(Execution.ticker),
            joinedload(Execution.trade)
        ).filter(Execution.id == execution_id).first()

# Initialize base API
execution_service = ExecutionService()
base_api = BaseEntityAPI('executions', execution_service, 'executions')

@executions_bp.route('/', methods=['GET'])
@handle_database_session()
def get_executions():
    """Get all executions using base API with rate limiting"""
    db: Session = g.db
    response, status_code = base_api.get_all(db)
    return jsonify(response), status_code

@executions_bp.route('/<int:execution_id>', methods=['GET'])
@handle_database_session()
def get_execution(execution_id: int):
    """Get execution by ID using base API"""
    db: Session = g.db
    response, status_code = base_api.get_by_id(db, execution_id)
    return jsonify(response), status_code

@executions_bp.route('/', methods=['POST'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['executions', 'trades', 'dashboard', 'account-activity-*', 'positions', 'portfolio'])  # Invalidate cache after creating execution
def create_execution():
    """Create new execution"""
    try:
        data = request.get_json()
        logger.info(f"Received execution data: {data}")
        db: Session = g.db
        
        # Validate data against constraints
        logger.info("Validating execution data before creation")
        is_valid, errors = ValidationService.validate_data(db, 'executions', data)
        if not is_valid:
            error_message = "; ".join(errors)
            logger.error(f"Execution validation failed: {error_message}")
            return jsonify({
                "status": "error",
                "error": {"message": f"Execution validation failed: {error_message}"},
                "version": "1.0"
            }), 400
        
        logger.info(f"Creating execution with data: {data}")
        
        # Auto-fill ticker_id from trade if not provided but trade_id exists
        if not data.get('ticker_id') and data.get('trade_id'):
            from models.trade import Trade
            trade = db.query(Trade).filter(Trade.id == data['trade_id']).first()
            if trade and trade.ticker_id:
                data['ticker_id'] = trade.ticker_id
                logger.info(f"Auto-filled ticker_id {trade.ticker_id} from trade {data['trade_id']}")
        
        # Convert date string to datetime object if provided
        if 'date' in data and data['date']:
            from datetime import datetime
            try:
                data['date'] = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
            except ValueError:
                data['date'] = datetime.strptime(data['date'], '%Y-%m-%dT%H:%M:%S')
        
        # Sanitize HTML content for notes field
        if 'notes' in data and data['notes']:
            data['notes'] = BaseEntityUtils.sanitize_rich_text(data['notes'])
        
        execution = Execution(**data)
        db.add(execution)
        db.commit()
        db.refresh(execution)
        return jsonify({
            "status": "success",
            "data": execution.to_dict(),
            "message": "Execution created successfully",
            "version": "1.0"
        }), 201
    except Exception as e:
        logger.error(f"Error creating execution: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400

@executions_bp.route('/<int:execution_id>', methods=['PUT'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['executions', 'trades', 'dashboard', 'account-activity-*'])  # Invalidate cache after updating execution
def update_execution(execution_id: int):
    """Update execution"""
    try:
        data = request.get_json()
        db: Session = g.db
        execution = db.query(Execution).filter(Execution.id == execution_id).first()
        if execution:
            # Validate data against constraints
            logger.info("Validating execution data before update")
            is_valid, errors = ValidationService.validate_data(db, 'executions', data, exclude_id=execution_id)
            if not is_valid:
                error_message = "; ".join(errors)
                logger.error(f"Execution validation failed: {error_message}")
                return jsonify({
                    "status": "error",
                    "error": {"message": f"Execution validation failed: {error_message}"},
                    "version": "1.0"
                }), 400
            
            # Convert date string to datetime object if provided
            if 'date' in data and data['date']:
                from datetime import datetime
                try:
                    data['date'] = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
                except ValueError:
                    data['date'] = datetime.strptime(data['date'], '%Y-%m-%dT%H:%M:%S')
            
            # Auto-fill ticker_id from trade if not provided but trade_id exists
            if not data.get('ticker_id') and data.get('trade_id'):
                from models.trade import Trade
                trade = db.query(Trade).filter(Trade.id == data['trade_id']).first()
                if trade and trade.ticker_id:
                    data['ticker_id'] = trade.ticker_id
                    logger.info(f"Auto-filled ticker_id {trade.ticker_id} from trade {data['trade_id']}")
            
            # Sanitize HTML content for notes field
            if 'notes' in data and data['notes']:
                data['notes'] = BaseEntityUtils.sanitize_rich_text(data['notes'])
            
            for key, value in data.items():
                if hasattr(execution, key):
                    setattr(execution, key, value)
            db.commit()
            db.refresh(execution)
            return jsonify({
                "status": "success",
                "data": execution.to_dict(),
                "message": "Execution updated successfully",
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Execution not found"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error updating execution {execution_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400

@executions_bp.route('/<int:execution_id>', methods=['DELETE'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['executions', 'trades', 'dashboard', 'account-activity-*'])  # Invalidate cache after deleting execution
def delete_execution(execution_id: int):
    """Delete execution"""
    try:
        db: Session = g.db
        execution = db.query(Execution).filter(Execution.id == execution_id).first()
        if execution:
            db.delete(execution)
            db.commit()
            return jsonify({
                "status": "success",
                "message": "Execution deleted successfully",
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Execution not found"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error deleting execution {execution_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500
