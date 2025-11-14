from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session, joinedload
from config.database import get_db
from models.execution import Execution
from services.validation_service import ValidationService
from services.advanced_cache_service import cache_for, cache_with_deps, invalidate_cache
from services.execution_trade_matching_service import ExecutionTradeMatchingService
from services.date_normalization_service import DateNormalizationService
from services.preferences_service import PreferencesService
from services.tag_service import TagService
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
preferences_service = PreferencesService()


def _get_date_normalizer():
    timezone_name = DateNormalizationService.resolve_timezone(
        request,
        preferences_service=preferences_service
    )
    return DateNormalizationService(timezone_name)

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
        normalizer = _get_date_normalizer()
        db: Session = g.db
        
        # Validate data against constraints
        logger.info("Validating execution data before creation")
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
        
        normalized_payload = normalizer.normalize_input_payload(data)

        is_valid, errors = ValidationService.validate_data(db, 'executions', normalized_payload)
        if not is_valid:
            error_message = "; ".join(errors)
            logger.error(f"Execution validation failed: {error_message}")
            return jsonify({
                "status": "error",
                "error": {"message": f"Execution validation failed: {error_message}"},
                "timestamp": normalizer.now_envelope(),
                "version": "1.0"
            }), 400
        
        logger.info(f"Creating execution with data: {data}")
        
        execution = Execution(**normalized_payload)
        db.add(execution)
        db.commit()
        db.refresh(execution)
        return jsonify({
            "status": "success",
            "data": normalizer.normalize_output(execution.to_dict()),
            "message": "Execution created successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 201
    except Exception as e:
        logger.error(f"Error creating execution: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 400

@executions_bp.route('/<int:execution_id>', methods=['PUT'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['executions', 'trades', 'dashboard', 'account-activity-*'])  # Invalidate cache after updating execution
def update_execution(execution_id: int):
    """Update execution"""
    try:
        data = request.get_json()
        normalizer = _get_date_normalizer()
        db: Session = g.db
        execution = db.query(Execution).filter(Execution.id == execution_id).first()
        if execution:
            # Validate data against constraints
            logger.info("Validating execution data before update")
            if not data.get('ticker_id') and data.get('trade_id'):
                from models.trade import Trade
                trade = db.query(Trade).filter(Trade.id == data['trade_id']).first()
                if trade and trade.ticker_id:
                    data['ticker_id'] = trade.ticker_id
                    logger.info(f"Auto-filled ticker_id {trade.ticker_id} from trade {data['trade_id']}")
            
            if 'notes' in data and data['notes']:
                data['notes'] = BaseEntityUtils.sanitize_rich_text(data['notes'])
            
            normalized_payload = normalizer.normalize_input_payload(data)

            is_valid, errors = ValidationService.validate_data(db, 'executions', normalized_payload, exclude_id=execution_id)
            if not is_valid:
                error_message = "; ".join(errors)
                logger.error(f"Execution validation failed: {error_message}")
                return jsonify({
                    "status": "error",
                    "error": {"message": f"Execution validation failed: {error_message}"},
                    "timestamp": normalizer.now_envelope(),
                    "version": "1.0"
                }), 400

            for key, value in normalized_payload.items():
                if hasattr(execution, key):
                    setattr(execution, key, value)
            db.commit()
            db.refresh(execution)
            return jsonify({
                "status": "success",
                "data": normalizer.normalize_output(execution.to_dict()),
                "message": "Execution updated successfully",
                "timestamp": normalizer.now_envelope(),
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Execution not found"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error updating execution {execution_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
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
            try:
                TagService.remove_all_tags_for_entity(db, 'execution', execution_id)
            except ValueError as tag_error:
                logger.warning(
                    "Failed to remove tags for execution %s before deletion: %s",
                    execution_id,
                    tag_error,
                )
            db.delete(execution)
            db.commit()
            normalizer = _get_date_normalizer()
            return jsonify({
                "status": "success",
                "message": "Execution deleted successfully",
                "timestamp": normalizer.now_envelope(),
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Execution not found"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error deleting execution {execution_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 500

@executions_bp.route('/pending-assignment', methods=['GET'])
@handle_database_session()
def get_pending_assignment_executions():
    """Get executions without trade assignment"""
    normalizer = None
    try:
        db: Session = g.db
        preferences_service = PreferencesService()
        normalizer = BaseEntityUtils.get_request_normalizer(request, preferences_service=preferences_service)
        executions = ExecutionTradeMatchingService.get_pending_executions(db)
        
        # Convert to dict format
        executions_data = [execution.to_dict() for execution in executions]
        executions_data = BaseEntityUtils.normalize_output(normalizer, executions_data)
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=executions_data,
            extra={"count": len(executions_data)}
        )
        return jsonify(payload), 200
    except Exception as e:
        logger.error(f"Error getting pending executions: {str(e)}")
        error_payload = BaseEntityUtils.create_error_payload(normalizer, str(e))
        return jsonify(error_payload), 500

@executions_bp.route('/pending-assignment/highlights', methods=['GET'])
@handle_database_session()
def get_pending_assignment_highlights():
    """Get highlight cards for pending executions."""
    normalizer = None
    try:
        db: Session = g.db
        normalizer = _get_date_normalizer()

        items_limit = request.args.get('limit', default=5, type=int)
        suggestions_limit = request.args.get('suggestions', default=5, type=int)

        if not items_limit or items_limit <= 0:
            items_limit = 5
        if not suggestions_limit or suggestions_limit <= 0:
            suggestions_limit = 5

        highlights = ExecutionTradeMatchingService.get_pending_execution_highlights(
            db,
            max_items=items_limit,
            max_suggestions_per_execution=suggestions_limit
        )

        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=highlights,
            extra={"count": len(highlights)}
        )
        return jsonify(payload), 200
    except Exception as e:
        logger.error(f"Error getting pending execution highlights: {str(e)}")
        error_payload = BaseEntityUtils.create_error_payload(normalizer, str(e))
        return jsonify(error_payload), 500


@executions_bp.route('/pending-assignment/trade-creation-clusters', methods=['GET'])
@handle_database_session()
def get_pending_assignment_trade_creation_clusters():
    """Get execution clusters suited for creating new trades."""
    normalizer = None
    try:
        db: Session = g.db
        normalizer = _get_date_normalizer()

        items_limit = request.args.get('limit', default=None, type=int)

        clusters = ExecutionTradeMatchingService.get_execution_trade_creation_clusters(
            db,
            max_items=items_limit
        )

        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=clusters,
            extra={"count": len(clusters)}
        )
        return jsonify(payload), 200
    except Exception as e:
        logger.error(f"Error getting trade creation clusters: {str(e)}")
        error_payload = BaseEntityUtils.create_error_payload(normalizer, str(e))
        return jsonify(error_payload), 500

@executions_bp.route('/<int:execution_id>/suggest-trades', methods=['GET'])
@handle_database_session()
def suggest_trades_for_execution(execution_id: int):
    """Get trade suggestions for a specific execution"""
    normalizer = None
    try:
        db: Session = g.db
        preferences_service = PreferencesService()
        normalizer = BaseEntityUtils.get_request_normalizer(request, preferences_service=preferences_service)
        execution = db.query(Execution).filter(Execution.id == execution_id).first()
        
        if not execution:
            error_payload = BaseEntityUtils.create_error_payload(normalizer, "Execution not found")
            return jsonify(error_payload), 404
        
        suggestions = ExecutionTradeMatchingService.suggest_trades_for_execution(
            db, execution, max_suggestions=5
        )
        normalized_suggestions = BaseEntityUtils.normalize_output(normalizer, suggestions)
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=normalized_suggestions,
            extra={
                "execution_id": execution_id,
                "count": len(normalized_suggestions)
            }
        )
        return jsonify(payload), 200
    except Exception as e:
        logger.error(f"Error getting trade suggestions for execution {execution_id}: {str(e)}")
        error_payload = BaseEntityUtils.create_error_payload(normalizer, str(e))
        return jsonify(error_payload), 500

@executions_bp.route('/batch-assign', methods=['POST'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['executions', 'trades', 'dashboard', 'account-activity-*', 'positions', 'portfolio'])
def batch_assign_executions():
    """Batch assign executions to trades"""
    try:
        data = request.get_json()
        db: Session = g.db
        
        # Expected format: {"assignments": [{"execution_id": 1, "trade_id": 5}, ...]}
        assignments = data.get('assignments', [])
        
        if not assignments:
            return jsonify({
                "status": "error",
                "error": {"message": "No assignments provided"},
                "version": "1.0"
            }), 400
        
        results = {
            "success": [],
            "failed": []
        }
        
        for assignment in assignments:
            execution_id = assignment.get('execution_id')
            trade_id = assignment.get('trade_id')
            
            if not execution_id or not trade_id:
                results["failed"].append({
                    "execution_id": execution_id,
                    "trade_id": trade_id,
                    "error": "Missing execution_id or trade_id"
                })
                continue
            
            try:
                execution = db.query(Execution).filter(Execution.id == execution_id).first()
                if not execution:
                    results["failed"].append({
                        "execution_id": execution_id,
                        "trade_id": trade_id,
                        "error": "Execution not found"
                    })
                    continue
                
                # Verify trade exists and matches ticker
                from models.trade import Trade
                trade = db.query(Trade).filter(Trade.id == trade_id).first()
                if not trade:
                    results["failed"].append({
                        "execution_id": execution_id,
                        "trade_id": trade_id,
                        "error": "Trade not found"
                    })
                    continue
                
                # Verify ticker match
                if execution.ticker_id != trade.ticker_id:
                    results["failed"].append({
                        "execution_id": execution_id,
                        "trade_id": trade_id,
                        "error": "Ticker mismatch"
                    })
                    continue
                
                # Assign trade
                execution.trade_id = trade_id
                # Set trading_account_id from trade if not set
                if not execution.trading_account_id:
                    execution.trading_account_id = trade.trading_account_id
                
                results["success"].append({
                    "execution_id": execution_id,
                    "trade_id": trade_id
                })
                
            except Exception as e:
                logger.error(f"Error assigning execution {execution_id} to trade {trade_id}: {str(e)}")
                results["failed"].append({
                    "execution_id": execution_id,
                    "trade_id": trade_id,
                    "error": str(e)
                })
        
        db.commit()
        
        return jsonify({
            "status": "success",
            "data": results,
            "summary": {
                "total": len(assignments),
                "success": len(results["success"]),
                "failed": len(results["failed"])
            },
            "version": "1.0"
        }), 200
        
    except Exception as e:
        logger.error(f"Error in batch assign: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500
