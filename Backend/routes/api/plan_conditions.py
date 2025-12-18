"""
Plan Conditions API Routes
API endpoints for plan conditions management
"""

from __future__ import annotations

from flask import Blueprint, request, jsonify, g
from sqlalchemy.orm import Session
from datetime import datetime
import logging
import json
from typing import Dict, Any, List

from sqlalchemy import inspect, text

from models.plan_condition import PlanCondition
from models.trade_plan import TradePlan
from services.conditions_validation_service import ConditionsValidationService
from services.preferences_service import PreferencesService
from services.alert_service import AlertService
from services.conditions_data_requirements_service import ConditionsDataRequirementsService
from config.database import get_db
from .base_entity_utils import BaseEntityUtils
from .base_entity_decorators import handle_database_session

logger = logging.getLogger(__name__)

# Create blueprint
plan_conditions_bp = Blueprint('plan_conditions', __name__, url_prefix='/api/plan-conditions')
preferences_service = PreferencesService()


def _get_date_normalizer():
    return BaseEntityUtils.get_request_normalizer(request, preferences_service=preferences_service)


def _ensure_conditions_tables(db_session) -> None:
    """
    Ensure all conditions system tables and required columns exist in the active database.
    This guards against legacy databases that were created before the conditions system migration.
    """
    try:
        inspector = inspect(db_session.bind)
        existing_tables: List[str] = inspector.get_table_names()
        statements_executed = False

        # Core tables definitions (CREATE TABLE IF NOT EXISTS is idempotent in SQLite)
        table_statements = {
            'trading_methods': text("""
                CREATE TABLE IF NOT EXISTS trading_methods (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name_en VARCHAR(100) NOT NULL,
                    name_he VARCHAR(100) NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    description_en TEXT,
                    description_he TEXT,
                    icon_class VARCHAR(50),
                    is_active BOOLEAN DEFAULT 1,
                    sort_order INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(name_en),
                    UNIQUE(name_he)
                )
            """),
            'method_parameters': text("""
                CREATE TABLE IF NOT EXISTS method_parameters (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    method_id INTEGER NOT NULL,
                    parameter_key VARCHAR(50) NOT NULL,
                    parameter_name_en VARCHAR(100) NOT NULL,
                    parameter_name_he VARCHAR(100) NOT NULL,
                    parameter_type VARCHAR(20) NOT NULL,
                    default_value VARCHAR(100),
                    min_value VARCHAR(50),
                    max_value VARCHAR(50),
                    validation_rule TEXT,
                    is_required BOOLEAN DEFAULT 1,
                    sort_order INTEGER DEFAULT 0,
                    help_text_en TEXT,
                    help_text_he TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (method_id) REFERENCES trading_methods(id) ON DELETE CASCADE,
                    UNIQUE(method_id, parameter_key)
                )
            """),
            'plan_conditions': text("""
                CREATE TABLE IF NOT EXISTS plan_conditions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    trade_plan_id INTEGER NOT NULL,
                    method_id INTEGER NOT NULL,
                    condition_group INTEGER DEFAULT 0,
                    parameters_json TEXT NOT NULL,
                    logical_operator VARCHAR(10) DEFAULT 'NONE',
                    is_active BOOLEAN DEFAULT 1,
                    auto_generate_alerts BOOLEAN DEFAULT 1,
                    trigger_action VARCHAR(50) DEFAULT 'enter_trade_positive',
                    action_notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (trade_plan_id) REFERENCES trade_plans(id) ON DELETE CASCADE,
                    FOREIGN KEY (method_id) REFERENCES trading_methods(id)
                )
            """),
            'trade_conditions': text("""
                CREATE TABLE IF NOT EXISTS trade_conditions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    trade_id INTEGER NOT NULL,
                    method_id INTEGER NOT NULL,
                    condition_group INTEGER DEFAULT 0,
                    parameters_json TEXT NOT NULL,
                    logical_operator VARCHAR(10) DEFAULT 'NONE',
                    inherited_from_plan_condition_id INTEGER,
                    is_active BOOLEAN DEFAULT 1,
                    auto_generate_alerts BOOLEAN DEFAULT 1,
                    trigger_action VARCHAR(50) DEFAULT 'enter_trade_positive',
                    action_notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE,
                    FOREIGN KEY (method_id) REFERENCES trading_methods(id),
                    FOREIGN KEY (inherited_from_plan_condition_id) REFERENCES plan_conditions(id)
                )
            """),
            'condition_alerts_mapping': text("""
                CREATE TABLE IF NOT EXISTS condition_alerts_mapping (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    condition_id INTEGER NOT NULL,
                    condition_type VARCHAR(10) NOT NULL,
                    alert_id INTEGER NOT NULL,
                    auto_created BOOLEAN DEFAULT 0,
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE
                )
            """)
        }

        for table_name, statement in table_statements.items():
            if table_name not in existing_tables:
                db_session.execute(statement)
                statements_executed = True

        # Ensure critical columns exist (auto_generate_alerts for legacy databases)
        def ensure_column(table: str, column: str, alter_stmt: str):
            pragma_rows = db_session.execute(text(f"PRAGMA table_info({table})")).fetchall()
            column_names = {row[1] for row in pragma_rows}
            if column not in column_names:
                db_session.execute(text(alter_stmt))
                return True
            return False

        altered = False
        altered |= ensure_column(
            'plan_conditions',
            'auto_generate_alerts',
            "ALTER TABLE plan_conditions ADD COLUMN auto_generate_alerts BOOLEAN DEFAULT 1 NOT NULL"
        )
        altered |= ensure_column(
            'plan_conditions',
            'trigger_action',
            "ALTER TABLE plan_conditions ADD COLUMN trigger_action VARCHAR(50) DEFAULT 'enter_trade_positive' NOT NULL"
        )
        altered |= ensure_column(
            'plan_conditions',
            'action_notes',
            "ALTER TABLE plan_conditions ADD COLUMN action_notes TEXT"
        )
        altered |= ensure_column(
            'trade_conditions',
            'auto_generate_alerts',
            "ALTER TABLE trade_conditions ADD COLUMN auto_generate_alerts BOOLEAN DEFAULT 1 NOT NULL"
        )
        altered |= ensure_column(
            'trade_conditions',
            'trigger_action',
            "ALTER TABLE trade_conditions ADD COLUMN trigger_action VARCHAR(50) DEFAULT 'enter_trade_positive' NOT NULL"
        )
        altered |= ensure_column(
            'trade_conditions',
            'action_notes',
            "ALTER TABLE trade_conditions ADD COLUMN action_notes TEXT"
        )

        # Create indexes (IF NOT EXISTS is safe to call repeatedly)
        index_statements = [
            "CREATE INDEX IF NOT EXISTS idx_plan_conditions_plan_id ON plan_conditions(trade_plan_id)",
            "CREATE INDEX IF NOT EXISTS idx_plan_conditions_method_id ON plan_conditions(method_id)",
            "CREATE INDEX IF NOT EXISTS idx_trade_conditions_trade_id ON trade_conditions(trade_id)",
            "CREATE INDEX IF NOT EXISTS idx_trade_conditions_method_id ON trade_conditions(method_id)",
            "CREATE INDEX IF NOT EXISTS idx_trade_conditions_inherited ON trade_conditions(inherited_from_plan_condition_id)",
            "CREATE INDEX IF NOT EXISTS idx_conditions_mapping_condition ON condition_alerts_mapping(condition_id, condition_type)",
            "CREATE INDEX IF NOT EXISTS idx_conditions_mapping_alert ON condition_alerts_mapping(alert_id)",
            "CREATE INDEX IF NOT EXISTS idx_method_parameters_method_id ON method_parameters(method_id)"
        ]

        for stmt in index_statements:
            db_session.execute(text(stmt))

        if statements_executed or altered:
            db_session.commit()

    except Exception as ensure_error:
        logger.error(f"Failed ensuring conditions tables exist: {ensure_error}")
        db_session.rollback()
        raise


def _build_condition_alert_stats(stats_map: Dict[int, Dict[str, Any]] | None, condition_id: int | None) -> Dict[str, Any]:
    base_stats = AlertService.default_condition_stats()
    if not condition_id or not stats_map:
        return base_stats
    stats = stats_map.get(condition_id)
    if not stats:
        return base_stats
    merged = base_stats.copy()
    merged.update(stats)
    return merged

@plan_conditions_bp.route('/trade-plans/<int:plan_id>/conditions', methods=['GET'])
def get_plan_conditions(plan_id):
    """Get all conditions for a specific trade plan"""
    normalizer = _get_date_normalizer()

    try:
        db_session = next(get_db())

        try:
            # Get user_id from Flask context (set by auth middleware)
            from flask import g
            user_id = getattr(g, 'user_id', None)
            
            # Note: Tables are created via SQLAlchemy models (Base.metadata.create_all)
            # _ensure_conditions_tables is deprecated - was using SQLite syntax, incompatible with PostgreSQL

            # Check if trade plan exists and belongs to user
            query = db_session.query(TradePlan).filter(TradePlan.id == plan_id)
            if user_id is not None:
                query = query.filter(TradePlan.user_id == user_id)
            plan = query.first()
            if not plan:
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    f'Trade plan with ID {plan_id} not found or does not belong to user',
                    {"code": "PLAN_NOT_FOUND"}
                )
                return jsonify(payload), 404

            conditions = (
                db_session.query(PlanCondition)
                .filter(PlanCondition.trade_plan_id == plan_id)
                .order_by(PlanCondition.condition_group, PlanCondition.created_at)
                .all()
            )
            condition_ids = [condition.id for condition in conditions if condition.id]
            stats_map = {}
            if condition_ids:
                stats_map = AlertService.get_condition_alert_stats(db_session, condition_ids, 'plan')

            result = []
            for condition in conditions:
                condition_dict = condition.to_dict()
                condition_dict['alert_stats'] = _build_condition_alert_stats(stats_map, condition.id)
                result.append(condition_dict)

            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                result,
                extra={
                    'count': len(result),
                    'trade_plan_id': plan_id
                }
            )
            return jsonify(payload), 200
        finally:
            db_session.close()

    except Exception as e:
        logger.error(f"Error getting plan conditions for plan {plan_id}: {e}")
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 500

@plan_conditions_bp.route('/trade-plans/<int:plan_id>/conditions', methods=['POST'])
def create_plan_condition(plan_id):
    """Create new condition for a trade plan"""
    try:
        data = request.get_json()
        normalizer = _get_date_normalizer()

        if not data:
            payload = BaseEntityUtils.create_error_payload(
                normalizer,
                'No data provided',
                {"code": "NO_DATA"}
            )
            return jsonify(payload), 400

        # Add trade_plan_id to data
        data['trade_plan_id'] = plan_id
        
        # Get database session
        db_session = next(get_db())
        
        try:
            # Note: Tables are created via SQLAlchemy models (Base.metadata.create_all)
            # _ensure_conditions_tables is deprecated - was using SQLite syntax, incompatible with PostgreSQL
            normalizer = _get_date_normalizer()
            
            # Get user_id from Flask context (set by auth middleware)
            from flask import g
            user_id = getattr(g, 'user_id', None)
            
            # Check if trade plan exists and belongs to user
            query = db_session.query(TradePlan).filter(TradePlan.id == plan_id)
            if user_id is not None:
                query = query.filter(TradePlan.user_id == user_id)
            plan = query.first()
            if not plan:
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    f'Trade plan with ID {plan_id} not found or does not belong to user',
                    {"code": "PLAN_NOT_FOUND"}
                )
                return jsonify(payload), 404

            # Validate data
            validator = ConditionsValidationService(db_session)
            normalized_payload = BaseEntityUtils.normalize_input(normalizer, data)
            is_valid, validation_result = validator.validate_condition_data(normalized_payload, 'plan')
            
            if not is_valid:
                errors = validation_result.get('errors', {})
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    errors.get('general', 'Validation failed'),
                    {"fields": errors.get('fields')}
                )
                return jsonify(payload), 400
            
            # Create condition
            # Convert parameters_json to string if it's a dict
            parameters_json = normalized_payload['parameters_json']
            if isinstance(parameters_json, dict):
                import json
                parameters_json = json.dumps(parameters_json, ensure_ascii=False)
            
            sanitized_action_notes = BaseEntityUtils.sanitize_rich_text(
                normalized_payload.get('action_notes')
            ) if normalized_payload.get('action_notes') else None

            condition = PlanCondition(
                trade_plan_id=plan_id,
                method_id=normalized_payload['method_id'],
                condition_group=normalized_payload.get('condition_group', 0),
                parameters_json=parameters_json,
                logical_operator=normalized_payload.get('logical_operator', 'NONE'),
                is_active=normalized_payload.get('is_active', True),
                auto_generate_alerts=normalized_payload.get('auto_generate_alerts', True),
                trigger_action=normalized_payload.get('trigger_action', 'enter_trade_positive'),
                action_notes=sanitized_action_notes
            )
            
            db_session.add(condition)
            db_session.commit()
            
            # Check condition readiness
            readiness_service = ConditionsDataRequirementsService(db_session)
            ticker_id = plan.ticker_id
            readiness = readiness_service.check_condition_readiness(
                condition.id,
                'plan',
                ticker_id
            )
            
            # Return created condition
            condition_dict = condition.to_dict()
            condition_dict['alert_stats'] = AlertService.default_condition_stats()
            condition_dict['alert_stats'] = _build_condition_alert_stats(
                AlertService.get_condition_alert_stats(db_session, [condition.id], 'plan'),
                condition.id
            )
            # Add readiness status
            condition_dict['readiness_status'] = readiness['status']
            condition_dict['readiness_message'] = readiness['message']
            condition_dict['missing_data'] = readiness.get('missing_data', [])
            
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                condition_dict,
                "Plan condition created successfully"
            )
            return jsonify(payload), 201
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error creating plan condition for plan {plan_id}: {e}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 500

@plan_conditions_bp.route('/<int:condition_id>', methods=['GET'])
def get_plan_condition(condition_id):
    """Get specific plan condition"""
    try:
        normalizer = _get_date_normalizer()

        # Get database session
        db_session = next(get_db())
        
        try:
            # Note: Tables are created via SQLAlchemy models (Base.metadata.create_all)
            # _ensure_conditions_tables is deprecated - was using SQLite syntax, incompatible with PostgreSQL
            
            # Get user_id from Flask context (set by auth middleware)
            from flask import g
            user_id = getattr(g, 'user_id', None)
            
            condition = db_session.query(PlanCondition).filter(
                PlanCondition.id == condition_id
            ).first()
            
            if not condition:
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    f'Plan condition with ID {condition_id} not found',
                    {"code": "CONDITION_NOT_FOUND"}
                )
                return jsonify(payload), 404
            
            # Verify trade plan belongs to user
            if user_id is not None:
                plan = db_session.query(TradePlan).filter(
                    TradePlan.id == condition.trade_plan_id,
                    TradePlan.user_id == user_id
                ).first()
                if not plan:
                    payload = BaseEntityUtils.create_error_payload(
                        normalizer,
                        f'Plan condition with ID {condition_id} does not belong to user',
                        {"code": "ACCESS_DENIED"}
                    )
                    return jsonify(payload), 403
            
            # Convert to dictionary
            condition_dict = condition.to_dict()
            
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                condition_dict
            )
            return jsonify(payload), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error getting plan condition {condition_id}: {e}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 500

@plan_conditions_bp.route('/<int:condition_id>', methods=['PUT'])
def update_plan_condition(condition_id):
    """Update plan condition"""
    try:
        data = request.get_json()
        normalizer = _get_date_normalizer()

        if not data:
            payload = BaseEntityUtils.create_error_payload(
                normalizer,
                'No data provided',
                {"code": "NO_DATA"}
            )
            return jsonify(payload), 400

        # Get database session
        db_session = next(get_db())
        
        try:
            # Note: Tables are created via SQLAlchemy models (Base.metadata.create_all)
            # _ensure_conditions_tables is deprecated - was using SQLite syntax, incompatible with PostgreSQL
            
            # Get user_id from Flask context (set by auth middleware)
            from flask import g
            user_id = getattr(g, 'user_id', None)
            
            condition = db_session.query(PlanCondition).filter(
                PlanCondition.id == condition_id
            ).first()
            
            if not condition:
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    f'Plan condition with ID {condition_id} not found',
                    {"code": "CONDITION_NOT_FOUND"}
                )
                return jsonify(payload), 404
            
            # Verify trade plan belongs to user
            if user_id is not None:
                plan = db_session.query(TradePlan).filter(
                    TradePlan.id == condition.trade_plan_id,
                    TradePlan.user_id == user_id
                ).first()
                if not plan:
                    payload = BaseEntityUtils.create_error_payload(
                        normalizer,
                        f'Plan condition with ID {condition_id} does not belong to user',
                        {"code": "ACCESS_DENIED"}
                    )
                    return jsonify(payload), 403
            
            # Add trade_plan_id to data for validation
            data['trade_plan_id'] = condition.trade_plan_id
            
            # Validate data
            validator = ConditionsValidationService(db_session)
            normalized_payload = BaseEntityUtils.normalize_input(normalizer, data)
            is_valid, validation_result = validator.validate_condition_data(normalized_payload, 'plan')
            
            if not is_valid:
                errors = validation_result.get('errors', {})
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    errors.get('general', 'Validation failed'),
                    {"fields": errors.get('fields')}
                )
                return jsonify(payload), 400
            
            # Update condition
            # Convert parameters_json to string if it's a dict
            parameters_json = normalized_payload['parameters_json']
            if isinstance(parameters_json, dict):
                import json
                parameters_json = json.dumps(parameters_json, ensure_ascii=False)
            
            condition.method_id = normalized_payload['method_id']
            condition.condition_group = normalized_payload.get('condition_group', condition.condition_group)
            condition.parameters_json = parameters_json
            condition.logical_operator = normalized_payload.get('logical_operator', condition.logical_operator)
            condition.is_active = normalized_payload.get('is_active', condition.is_active)
            condition.auto_generate_alerts = normalized_payload.get('auto_generate_alerts', condition.auto_generate_alerts)
            condition.trigger_action = normalized_payload.get('trigger_action', condition.trigger_action)
            if 'action_notes' in normalized_payload:
                sanitized_action_notes = BaseEntityUtils.sanitize_rich_text(
                    normalized_payload.get('action_notes')
                ) if normalized_payload.get('action_notes') else None
                condition.action_notes = sanitized_action_notes
            
            db_session.commit()
            
            # Check condition readiness
            readiness_service = ConditionsDataRequirementsService(db_session)
            # Get ticker_id from trade_plan
            plan = db_session.query(TradePlan).filter(
                TradePlan.id == condition.trade_plan_id
            ).first()
            if plan:
                ticker_id = plan.ticker_id
                readiness = readiness_service.check_condition_readiness(
                    condition.id,
                    'plan',
                    ticker_id
                )
            else:
                readiness = {
                    'status': 'error',
                    'message': 'Trade plan not found',
                    'missing_data': []
                }
            
            # Return updated condition with alert stats
            stats_map = AlertService.get_condition_alert_stats(db_session, [condition.id], 'plan')
            condition_dict = condition.to_dict()
            condition_dict['alert_stats'] = _build_condition_alert_stats(stats_map, condition.id)
            # Add readiness status
            condition_dict['readiness_status'] = readiness['status']
            condition_dict['readiness_message'] = readiness['message']
            condition_dict['missing_data'] = readiness.get('missing_data', [])
            
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                condition_dict,
                "Plan condition updated successfully"
            )
            return jsonify(payload), 200
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error updating plan condition {condition_id}: {e}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 500

@plan_conditions_bp.route('/<int:condition_id>', methods=['DELETE'])
def delete_plan_condition(condition_id):
    """Delete plan condition"""
    try:
        normalizer = _get_date_normalizer()

        # Get database session
        db_session = next(get_db())
        
        try:
            # Note: Tables are created via SQLAlchemy models (Base.metadata.create_all)
            # _ensure_conditions_tables is deprecated - was using SQLite syntax, incompatible with PostgreSQL
            
            # Get user_id from Flask context (set by auth middleware)
            from flask import g
            user_id = getattr(g, 'user_id', None)
            
            condition = db_session.query(PlanCondition).filter(
                PlanCondition.id == condition_id
            ).first()
            
            if not condition:
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    f'Plan condition with ID {condition_id} not found',
                    {"code": "CONDITION_NOT_FOUND"}
                )
                return jsonify(payload), 404
            
            # Verify trade plan belongs to user
            if user_id is not None:
                plan = db_session.query(TradePlan).filter(
                    TradePlan.id == condition.trade_plan_id,
                    TradePlan.user_id == user_id
                ).first()
                if not plan:
                    payload = BaseEntityUtils.create_error_payload(
                        normalizer,
                        f'Plan condition with ID {condition_id} does not belong to user',
                        {"code": "ACCESS_DENIED"}
                    )
                    return jsonify(payload), 403
            
            # Check if condition is inherited by trade conditions
            from models.trade_condition import TradeCondition
            inherited_count = db_session.query(TradeCondition).filter(
                TradeCondition.inherited_from_plan_condition_id == condition_id
            ).count()
            
            if inherited_count > 0:
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    f'Cannot delete condition. It is inherited by {inherited_count} trade conditions',
                    {"code": "CONDITION_INHERITED"}
                )
                return jsonify(payload), 400
            
            # Check if user wants to delete associated alerts
            delete_alerts = request.json.get('delete_alerts', False) if request.is_json else False
            deleted_count = 0
            
            # Delete associated alerts if requested
            if delete_alerts:
                alert_service = AlertService(db_session)
                deleted_count = alert_service.delete_condition_alerts(db_session, plan_condition_id=condition_id)
                logger.info(f"Deleted {deleted_count} alerts for condition {condition_id}")
            
            # Delete condition
            db_session.delete(condition)
            db_session.commit()
            
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                None,
                "Plan condition deleted successfully",
                extra={'alerts_deleted': deleted_count if delete_alerts else 0}
            )
            return jsonify(payload), 200
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error deleting plan condition {condition_id}: {e}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 500

@plan_conditions_bp.route('/<int:condition_id>/test', methods=['POST'])
def test_plan_condition(condition_id):
    """Test plan condition against current market data"""
    normalizer = _get_date_normalizer()
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get user_id from Flask context (set by auth middleware)
            from flask import g
            user_id = getattr(g, 'user_id', None)
            
            condition = db_session.query(PlanCondition).filter(
                PlanCondition.id == condition_id
            ).first()
            
            if not condition:
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    f'Plan condition with ID {condition_id} not found',
                    {"code": "CONDITION_NOT_FOUND"}
                )
                return jsonify(payload), 404
            
            # Verify trade plan belongs to user
            query = db_session.query(TradePlan).filter(TradePlan.id == condition.trade_plan_id)
            if user_id is not None:
                query = query.filter(TradePlan.user_id == user_id)
            plan = query.first()
            
            if not plan:
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    'Trade plan not found or does not belong to user',
                    {"code": "PLAN_NOT_FOUND"}
                )
                return jsonify(payload), 404
            
            # TODO: Implement condition evaluation service
            # For now, return a placeholder response
            data = {
                'condition_id': condition_id,
                'ticker_id': plan.ticker_id,
                'evaluation_result': 'pending',
                'message': 'Condition evaluation not yet implemented'
            }
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                data,
                "Condition test completed"
            )
            return jsonify(payload), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error testing plan condition {condition_id}: {e}")
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 500

@plan_conditions_bp.route('/validate', methods=['POST'])
def validate_plan_condition():
    """Validate plan condition data without creating it"""
    normalizer = _get_date_normalizer()
    try:
        data = request.get_json()
        if not data:
            payload = BaseEntityUtils.create_error_payload(
                normalizer,
                'No data provided',
                {"code": "NO_DATA"}
            )
            return jsonify(payload), 400
        
        # Get database session
        db_session = next(get_db())
        
        try:
            # Validate data
            validator = ConditionsValidationService(db_session)
            is_valid, validation_result = validator.validate_condition_data(data, 'plan')
            
            if is_valid:
                payload = BaseEntityUtils.create_success_payload(
                    normalizer,
                    None,
                    'Validation passed'
                )
                return jsonify(payload), 200
            else:
                # Normalize validation_result if it contains dates
                normalized_result = normalizer.normalize_output(validation_result)
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    'Validation failed',
                    normalized_result
                )
                return jsonify(payload), 400
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error validating plan condition: {e}")
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 500

@plan_conditions_bp.route('/bulk', methods=['POST'])
def create_bulk_plan_conditions():
    """Create multiple plan conditions at once"""
    try:
        data = request.get_json()
        if not data or 'conditions' not in data:
            return jsonify({
                'status': 'error',
                'message': 'No conditions data provided',
                'error_code': 'NO_DATA'
            }), 400
        
        conditions_data = data['conditions']
        plan_id = data.get('trade_plan_id')
        
        if not plan_id:
            return jsonify({
                'status': 'error',
                'message': 'trade_plan_id is required',
                'error_code': 'MISSING_PLAN_ID'
            }), 400
        
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get user_id from Flask context (set by auth middleware)
            from flask import g
            user_id = getattr(g, 'user_id', None)
            
            # Check if trade plan exists and belongs to user
            query = db_session.query(TradePlan).filter(TradePlan.id == plan_id)
            if user_id is not None:
                query = query.filter(TradePlan.user_id == user_id)
            plan = query.first()
            if not plan:
                return jsonify({
                    'status': 'error',
                    'message': f'Trade plan with ID {plan_id} not found or does not belong to user',
                    'error_code': 'PLAN_NOT_FOUND'
                }), 404
            
            # Validate all conditions
            validator = ConditionsValidationService(db_session)
            is_valid, validation_result = validator.validate_bulk_conditions(conditions_data, 'plan')
            
            if not is_valid:
                return jsonify(validation_result), 400
            
            # Create conditions
            created_conditions = []
            for condition_data in conditions_data:
                condition_data['trade_plan_id'] = plan_id
                
                # Convert parameters_json to string if it's a dict
                parameters_json = condition_data['parameters_json']
                if isinstance(parameters_json, dict):
                    import json
                    parameters_json = json.dumps(parameters_json, ensure_ascii=False)

                sanitized_action_notes = BaseEntityUtils.sanitize_rich_text(
                    condition_data.get('action_notes')
                ) if condition_data.get('action_notes') else None
                
                condition = PlanCondition(
                    trade_plan_id=plan_id,
                    method_id=condition_data['method_id'],
                    condition_group=condition_data.get('condition_group', 0),
                    parameters_json=parameters_json,
                    logical_operator=condition_data.get('logical_operator', 'NONE'),
                    is_active=condition_data.get('is_active', True),
                    auto_generate_alerts=condition_data.get('auto_generate_alerts', True),
                    trigger_action=condition_data.get('trigger_action', 'enter_trade_positive'),
                    action_notes=sanitized_action_notes
                )
                
                db_session.add(condition)
                created_conditions.append(condition)
            
            db_session.commit()
            
            # Return created conditions
            result = []
            for condition in created_conditions:
                condition_dict = condition.to_dict()
                result.append(condition_dict)
            
            # Normalize dates in result
            normalizer = _get_date_normalizer()
            normalized_result = normalizer.normalize_output(result)
            
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                normalized_result,
                f'{len(result)} plan conditions created successfully',
                extra={'count': len(result)}
            )
            return jsonify(payload), 201
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error creating bulk plan conditions: {e}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 500

@plan_conditions_bp.route('/<int:condition_id>/evaluate', methods=['POST'])
def evaluate_condition(condition_id):
    """Evaluate a single plan condition"""
    normalizer = _get_date_normalizer()
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get user_id from Flask context (set by auth middleware)
            from flask import g
            user_id = getattr(g, 'user_id', None)
            
            # Get condition with relationships
            condition = db_session.query(PlanCondition).filter(
                PlanCondition.id == condition_id
            ).first()
            
            if not condition:
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    f'Plan condition with ID {condition_id} not found',
                    {"code": "CONDITION_NOT_FOUND"}
                )
                return jsonify(payload), 404
            
            # Verify trade plan belongs to user
            if user_id is not None:
                plan = db_session.query(TradePlan).filter(
                    TradePlan.id == condition.trade_plan_id,
                    TradePlan.user_id == user_id
                ).first()
                if not plan:
                    payload = BaseEntityUtils.create_error_payload(
                        normalizer,
                        f'Plan condition with ID {condition_id} does not belong to user',
                        {"code": "ACCESS_DENIED"}
                    )
                    return jsonify(payload), 403
            
            # Import and use ConditionEvaluator
            from services.condition_evaluator import ConditionEvaluator
            evaluator = ConditionEvaluator(db_session)
            
            # Evaluate condition
            result = evaluator.evaluate_condition(condition)
            
            # Normalize dates in result
            normalized_result = normalizer.normalize_output(result)
            
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                normalized_result,
                'Condition evaluated successfully'
            )
            return jsonify(payload), 200
            
        except Exception as e:
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error evaluating condition {condition_id}: {str(e)}")
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f'Error evaluating condition: {str(e)}',
            {"code": "EVALUATION_ERROR"}
        )
        return jsonify(payload), 500

@plan_conditions_bp.route('/evaluate-all', methods=['POST'])
def evaluate_all_conditions():
    """Evaluate all active plan conditions"""
    normalizer = _get_date_normalizer()
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get user_id from Flask context (set by auth middleware)
            from flask import g
            user_id = getattr(g, 'user_id', None)
            
            # Import and use ConditionEvaluator
            from services.condition_evaluator import ConditionEvaluator
            evaluator = ConditionEvaluator(db_session)
            
            # Evaluate all active conditions (filtered by user_id if provided)
            results = evaluator.evaluate_all_active_conditions(user_id=user_id)
            
            # Filter only plan conditions
            plan_results = [r for r in results if r.get('condition_type') == 'plan']
            
            # Normalize dates in results
            normalized_results = normalizer.normalize_output(plan_results)
            
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                normalized_results,
                f'{len(plan_results)} plan conditions evaluated',
                extra={'count': len(plan_results)}
            )
            return jsonify(payload), 200
            
        except Exception as e:
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error evaluating all conditions: {str(e)}")
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f'Error evaluating all conditions: {str(e)}',
            {"code": "EVALUATION_ERROR"}
        )
        return jsonify(payload), 500

@plan_conditions_bp.route('/<int:condition_id>/evaluation-history', methods=['GET'])
def get_evaluation_history(condition_id):
    """Get evaluation history for a condition (from alerts)"""
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get user_id from Flask context (set by auth middleware)
            from flask import g
            user_id = getattr(g, 'user_id', None)
            
            # Check if condition exists
            condition = db_session.query(PlanCondition).filter(
                PlanCondition.id == condition_id
            ).first()
            
            if not condition:
                return jsonify({
                    'status': 'error',
                    'message': f'Plan condition with ID {condition_id} not found',
                    'error_code': 'CONDITION_NOT_FOUND'
                }), 404
            
            # Verify trade plan belongs to user
            if user_id is not None:
                plan = db_session.query(TradePlan).filter(
                    TradePlan.id == condition.trade_plan_id,
                    TradePlan.user_id == user_id
                ).first()
                if not plan:
                    return jsonify({
                        'status': 'error',
                        'message': f'Plan condition with ID {condition_id} does not belong to user',
                        'error_code': 'ACCESS_DENIED'
                    }), 403
            
            # Get alerts related to this condition (filtered by user_id)
            from models.alert import Alert
            query = db_session.query(Alert).filter(
                Alert.related_id == condition_id
            )
            if user_id is not None:
                query = query.filter(Alert.user_id == user_id)
            alerts = query.order_by(Alert.triggered_at.desc()).limit(50).all()
            
            # Convert to evaluation history format
            history = []
            for alert in alerts:
                if alert.triggered_at:  # Only include triggered alerts
                    history.append({
                        'evaluation_time': alert.triggered_at,  # Keep as datetime for normalization
                        'condition_met': True,
                        'alert_id': alert.id,
                        'message': alert.message,
                        'price': float(alert.condition_number) if alert.condition_number else 0
                    })
            
            # Normalize dates in history
            normalizer = _get_date_normalizer()
            normalized_history = normalizer.normalize_output(history)
            
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                normalized_history,
                f'Found {len(history)} evaluation records',
                extra={'count': len(history)}
            )
            return jsonify(payload), 200
            
        except Exception as e:
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error getting evaluation history for condition {condition_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f'Error getting evaluation history: {str(e)}',
            {"code": "HISTORY_ERROR"}
        )
        return jsonify(payload), 500

@plan_conditions_bp.route('/<int:condition_id>/create-alert', methods=['POST'])
def create_condition_alert(condition_id):
    """Create alert manually for a condition"""
    normalizer = _get_date_normalizer()
    try:
        # Get user_id from Flask context (set by auth middleware)
        from flask import g
        user_id = getattr(g, 'user_id', None)
        
        db_session = next(get_db())
        try:
            condition = db_session.query(PlanCondition).filter(PlanCondition.id == condition_id).first()
            if not condition:
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    f'Plan condition with ID {condition_id} not found'
                )
                return jsonify(payload), 404
            
            # Verify trade plan belongs to user
            if user_id is not None:
                plan = db_session.query(TradePlan).filter(
                    TradePlan.id == condition.trade_plan_id,
                    TradePlan.user_id == user_id
                ).first()
                if not plan:
                    payload = BaseEntityUtils.create_error_payload(
                        normalizer,
                        f'Plan condition with ID {condition_id} does not belong to user'
                    )
                    return jsonify(payload), 403
            
            # Check if alert already exists
            alert_service = AlertService(db_session)
            existing_alert = alert_service.get_alert_by_condition(db_session, plan_condition_id=condition_id)
            
            if existing_alert:
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    f'Alert already exists for condition {condition_id}',
                    {"alert_id": existing_alert.id}
                )
                return jsonify(payload), 400
            
            # Create alert data
            alert_data = {
                'message': f'Manual alert for condition {condition_id}',
                'related_id': condition.trade_plan_id,
                'related_type_id': 3,  # trade_plan
                'condition_attribute': 'price',
                'condition_operator': 'more_than',
                'condition_number': '0',
                'status': 'open',
                'is_triggered': 'false'
            }
            
            # Set user_id if authenticated
            if user_id is not None:
                alert_data['user_id'] = user_id
            
            alert = alert_service.create_or_update_alert_for_condition(
                db_session, condition_id, 'plan', alert_data
            )
            
            # Normalize dates in alert dict
            alert_dict = normalizer.normalize_output(alert.to_dict())
            
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                alert_dict,
                'Alert created successfully'
            )
            return jsonify(payload), 201
            
        except Exception as e:
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error creating alert for condition {condition_id}: {str(e)}")
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 500
        return jsonify({
            'status': 'error',
            'message': f'Error creating alert: {str(e)}'
        }), 500

@plan_conditions_bp.route('/<int:condition_id>/alert', methods=['DELETE'])
def delete_condition_alert(condition_id):
    """Delete alert for a condition"""
    try:
        # Get user_id from Flask context (set by auth middleware)
        from flask import g
        user_id = getattr(g, 'user_id', None)
        
        db_session = next(get_db())
        try:
            # Verify condition belongs to user
            condition = db_session.query(PlanCondition).filter(PlanCondition.id == condition_id).first()
            if condition and user_id is not None:
                plan = db_session.query(TradePlan).filter(
                    TradePlan.id == condition.trade_plan_id,
                    TradePlan.user_id == user_id
                ).first()
                if not plan:
                    normalizer = _get_date_normalizer()
                    payload = BaseEntityUtils.create_error_payload(
                        normalizer,
                        f'Plan condition with ID {condition_id} does not belong to user'
                    )
                    return jsonify(payload), 403
            
            alert_service = AlertService(db_session)
            
            deleted_count = alert_service.delete_condition_alerts(db_session, plan_condition_id=condition_id)
            
            return jsonify({
                'status': 'success',
                'deleted_count': deleted_count,
                'message': f'Deleted {deleted_count} alerts for condition {condition_id}'
            }), 200
            
        except Exception as e:
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error deleting alert for condition {condition_id}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error deleting alert: {str(e)}'
        }), 500

@plan_conditions_bp.route('/<int:condition_id>/alert/toggle', methods=['POST'])
@handle_database_session()
def toggle_condition_alert(condition_id):
    """Toggle alert creation for a condition (for authenticated user)"""
    db_session: Session = g.db
    
    # Get user_id from Flask context (set by auth middleware)
    user_id = getattr(g, 'user_id', None)
    
    if user_id is None:
        return jsonify({'status': 'error', 'message': 'User authentication required'}), 401
    
    try:
        # Filter by user_id through trade_plan - plan conditions belong to trade plans
        from models.trade_plan import TradePlan
        condition = db_session.query(PlanCondition).join(
            TradePlan, PlanCondition.trade_plan_id == TradePlan.id
        ).filter(
            PlanCondition.id == condition_id,
            TradePlan.user_id == user_id
        ).first()
        if not condition:
            return jsonify({'status': 'error', 'message': f'Plan condition with ID {condition_id} not found or access denied'}), 404
        
        # Toggle auto_generate_alerts
        condition.auto_generate_alerts = not condition.auto_generate_alerts
        db_session.commit()
        
        return jsonify({
            'status': 'success',
            'data': {
                'condition_id': condition_id,
                'auto_generate_alerts': condition.auto_generate_alerts
            },
            'message': f'Alert generation {"enabled" if condition.auto_generate_alerts else "disabled"} for condition {condition_id}'
        }), 200
            
    except Exception as e:
        logger.error(f"Error toggling alert for condition {condition_id}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error toggling alert: {str(e)}'
        }), 500
