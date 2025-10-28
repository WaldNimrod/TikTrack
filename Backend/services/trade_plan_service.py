from sqlalchemy.orm import Session, joinedload
from models.trade_plan import TradePlan
from services.validation_service import ValidationService
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class TradePlanService:
    @staticmethod
    def get_all(db: Session) -> List[TradePlan]:
        """Get all trade plans"""
        logger.info("Loading trade plans with joinedload for ticker and account")
        plans = db.query(TradePlan).options(
            joinedload(TradePlan.ticker),
            joinedload(TradePlan.account)
        ).all()
        logger.info(f"Loaded {len(plans)} trade plans")
        if plans:
            logger.info(f"First plan ticker: {plans[0].ticker}")
            logger.info(f"First plan account: {plans[0].account}")
        return plans
    
    @staticmethod
    def get_by_id(db: Session, plan_id: int) -> Optional[TradePlan]:
        """Get trade plan by ID"""
        return db.query(TradePlan).options(
            joinedload(TradePlan.ticker),
            joinedload(TradePlan.account)
        ).filter(TradePlan.id == plan_id).first()
    
    @staticmethod
    def get_by_account(db: Session, trading_account_id: int) -> List[TradePlan]:
        """Get trade plans by account"""
        return db.query(TradePlan).filter(TradePlan.trading_trading_account_id == trading_account_id).all()
    
    @staticmethod
    def get_by_ticker(db: Session, ticker_id: int) -> List[TradePlan]:
        """Get trade plans by ticker"""
        return db.query(TradePlan).filter(TradePlan.ticker_id == ticker_id).all()
    
    @staticmethod
    def get_open_plans(db: Session) -> List[TradePlan]:
        """Get open trade plans"""
        return db.query(TradePlan).filter(TradePlan.status == 'open').all()
    
    @staticmethod
    def create(db: Session, data: Dict[str, Any]) -> TradePlan:
        """Create new trade plan"""
        try:
            # Validate data against constraints
            logger.info("Validating trade plan data before creation")
            is_valid, errors = ValidationService.validate_data(db, 'trade_plans', data)
            if not is_valid:
                error_message = "; ".join(errors)
                logger.error(f"Trade plan validation failed: {error_message}")
                raise ValueError(f"Trade plan validation failed: {error_message}")
            
            plan = TradePlan(**data)
            db.add(plan)
            db.commit()
            db.refresh(plan)
            logger.info(f"Created trade plan: {plan.id} for ticker {plan.ticker_id}")
            return plan
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating trade plan: {e}")
            raise
    
    @staticmethod
    def update(db: Session, plan_id: int, data: Dict[str, Any]) -> Optional[TradePlan]:
        """Update trade plan"""
        try:
            plan = db.query(TradePlan).filter(TradePlan.id == plan_id).first()
            if not plan:
                logger.warning(f"Trade plan {plan_id} not found for update")
                return None
            
            # Check if status is being changed to cancelled
            if 'status' in data and data['status'] == 'cancelled':
                # Check if plan can be cancelled using specific validation
                cancel_check = TradePlanService.can_cancel_plan(db, plan_id)
                if not cancel_check['can_cancel']:
                    reasons = "; ".join(cancel_check['reasons'])
                    logger.warning(f"Cannot cancel trade plan {plan_id}: {reasons}")
                    raise ValueError(f"לא ניתן לבטל תכנון: {reasons}")
                
                # Set cancelled_at and cancel_reason if not provided
                if 'cancelled_at' not in data:
                    data['cancelled_at'] = datetime.utcnow()
                if 'cancel_reason' not in data:
                    data['cancel_reason'] = 'Cancelled by user'
            
            # Validate data against constraints
            logger.info("Validating trade plan data before update")
            is_valid, errors = ValidationService.validate_data(db, 'trade_plans', data, exclude_id=plan_id)
            if not is_valid:
                error_message = "; ".join(errors)
                logger.error(f"Trade plan validation failed: {error_message}")
                raise ValueError(f"Trade plan validation failed: {error_message}")
            
            for key, value in data.items():
                if hasattr(plan, key):
                    setattr(plan, key, value)
            db.commit()
            db.refresh(plan)
            logger.info(f"Updated trade plan: {plan.id}")
            return plan
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating trade plan {plan_id}: {e}")
            raise
    
    @staticmethod
    def delete(db: Session, plan_id: int) -> bool:
        """Delete trade plan"""
        from models.trade import Trade
        
        plan = db.query(TradePlan).filter(TradePlan.id == plan_id).first()
        if not plan:
            return False
        
        # Check for linked trades (simple check for now)
        trades = db.query(Trade).filter(Trade.trade_plan_id == plan_id).all()
        if trades:
            logger.warning(f"Cannot delete trade plan {plan_id}: has {len(trades)} linked trades")
            return False
        
        # Safe to delete
        db.delete(plan)
        db.commit()
        logger.info(f"Deleted trade plan: {plan_id}")
        return True
    
    @staticmethod
    def cancel_plan(db: Session, plan_id: int, cancel_reason: str) -> Optional[TradePlan]:
        """Cancel trade plan"""
        plan = db.query(TradePlan).filter(TradePlan.id == plan_id).first()
        if not plan:
            return None
            
        if plan.cancelled_at is not None:
            logger.warning(f"Trade plan {plan_id} is already cancelled")
            return None
            
        # Check if plan can be cancelled using specific validation
        cancel_check = TradePlanService.can_cancel_plan(db, plan_id)
        if not cancel_check['can_cancel']:
            reasons = "; ".join(cancel_check['reasons'])
            logger.warning(f"Cannot cancel trade plan {plan_id}: {reasons}")
            raise ValueError(f"לא ניתן לבטל תכנון: {reasons}")
        
        # Safe to cancel
        plan.cancelled_at = datetime.utcnow()
        plan.cancel_reason = cancel_reason
        plan.status = 'cancelled'  # Update status to cancelled
        db.commit()
        db.refresh(plan)
        logger.info(f"Cancelled trade plan: {plan_id}")
        
        # Update ticker active_trades status (triggers will handle this automatically)
        try:
            from app import update_ticker_open_status
            update_ticker_open_status(plan.ticker_id)
            logger.info(f"Updated ticker {plan.ticker_id} active_trades status after cancelling plan")
        except Exception as e:
            logger.warning(f"Could not update ticker active_trades status: {e}")
        
        return plan
    
    @staticmethod
    def activate_plan(db: Session, plan_id: int) -> Optional[TradePlan]:
        """Activate trade plan"""
        plan = db.query(TradePlan).filter(TradePlan.id == plan_id).first()
        if plan and plan.cancelled_at is not None:
            plan.cancelled_at = None
            plan.cancel_reason = None
            db.commit()
            db.refresh(plan)
            logger.info(f"Activated trade plan: {plan_id}")
            return plan
        return None
    
    @staticmethod
    def get_plan_summary(db: Session, trading_account_id: Optional[int] = None) -> Dict[str, Any]:
        """Get trade plan summary"""
        query = db.query(TradePlan)
        if trading_account_id:
            query = query.filter(TradePlan.trading_trading_account_id == trading_account_id)
        
        plans = query.all()
        
        total_plans = len(plans)
        open_plans = len([p for p in plans if p.status == 'open'])
        closed_plans = len([p for p in plans if p.status == 'closed'])
        cancelled_plans = len([p for p in plans if p.status == 'cancelled'])
        
        # Calculate amounts
        total_planned_amount = sum(p.planned_amount for p in plans if p.planned_amount)
        
        return {
            'total_plans': total_plans,
            'open_plans': open_plans,
            'closed_plans': closed_plans,
            'cancelled_plans': cancelled_plans,
            'total_planned_amount': total_planned_amount
        }
    
    @staticmethod
    def get_plans_by_investment_type(db: Session, investment_type: str) -> List[TradePlan]:
        """Get plans by investment type"""
        return db.query(TradePlan).filter(
            TradePlan.investment_type == investment_type,
            TradePlan.status == 'open'
        ).all()
    
    @staticmethod
    def get_plans_with_conditions(db: Session, conditions: Dict[str, Any]) -> List[TradePlan]:
        """Get plans with custom conditions"""
        query = db.query(TradePlan)
        
        if 'trading_account_id' in conditions:
            query = query.filter(TradePlan.trading_trading_account_id == conditions['trading_account_id'])
        
        if 'ticker_id' in conditions:
            query = query.filter(TradePlan.ticker_id == conditions['ticker_id'])
        
        if 'investment_type' in conditions:
            query = query.filter(TradePlan.investment_type == conditions['investment_type'])
        
        if conditions.get('open_only', True):
            query = query.filter(TradePlan.status == 'open')
        
        return query.all()

    @staticmethod
    def can_cancel_plan(db: Session, plan_id: int) -> Dict[str, Any]:
        """
        Check if a trade plan can be cancelled using specific validation rules
        
        Args:
            db: Database session
            plan_id: Trade plan ID
            
        Returns:
            Dictionary with can_cancel (bool) and reasons (list)
        """
        from services.ticker_service import TickerService
        
        result = {
            'can_cancel': True,
            'reasons': [],
            'linked_items': {},
            'validation_details': {
                'plan_exists': False,
                'plan_not_cancelled': False,
                'no_active_trades': False,
                'no_linked_notes': False,
                'no_linked_alerts': False,
                'no_linked_executions': False
            }
        }
        
        # Check if plan exists and is not already cancelled
        plan = db.query(TradePlan).filter(TradePlan.id == plan_id).first()
        if not plan:
            result['can_cancel'] = False
            result['reasons'].append("תכנון לא נמצא")
            return result
        result['validation_details']['plan_exists'] = True
            
        if plan.cancelled_at is not None:
            result['can_cancel'] = False
            result['reasons'].append("תכנון כבר מבוטל")
            return result
        result['validation_details']['plan_not_cancelled'] = True
        
        # Use general linked items system as base
        linked_items = TickerService.check_linked_items_generic(db, 'trade_plan', plan_id)
        result['linked_items'] = linked_items
        
        # Apply specific trade plan cancellation rules
        # Rule 1: Cannot cancel if there are active (non-cancelled) trades
        if linked_items['open_trades']:
            result['can_cancel'] = False
            result['reasons'].append(f"יש {len(linked_items['open_trades'])} טריידים פעילים מקושרים לתכנון")
        else:
            result['validation_details']['no_active_trades'] = True
        
        # Rule 2: Cannot cancel if there are linked notes
        if linked_items['notes']:
            result['can_cancel'] = False
            result['reasons'].append(f"יש {len(linked_items['notes'])} הערות מקושרות לתכנון")
        else:
            result['validation_details']['no_linked_notes'] = True
        
        # Rule 3: Cannot cancel if there are linked alerts
        if linked_items['alerts']:
            result['can_cancel'] = False
            result['reasons'].append(f"יש {len(linked_items['alerts'])} התראות מקושרות לתכנון")
        else:
            result['validation_details']['no_linked_alerts'] = True
        
        # Rule 4: Cannot cancel if there are linked executions
        if linked_items['executions']:
            result['can_cancel'] = False
            result['reasons'].append(f"יש {len(linked_items['executions'])} ביצועים מקושרים לתכנון")
        else:
            result['validation_details']['no_linked_executions'] = True
        
        return result


