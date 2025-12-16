from sqlalchemy.orm import Session, joinedload
from models.trade_plan import TradePlan
from services.validation_service import ValidationService
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class TradePlanService:
    @staticmethod
    def get_all(db: Session, user_id: Optional[int] = None) -> List[TradePlan]:
        """Get all trade plans"""
        logger.info("Loading trade plans with joinedload for ticker and account")
        
        # CRITICAL: Ensure clean transaction state - rollback any aborted transactions
        try:
            from sqlalchemy import text
            # Test query to check transaction state
            db.execute(text("SELECT 1"))
        except Exception as tx_error:
            error_msg = str(tx_error)
            if "aborted" in error_msg.lower() or "InFailedSqlTransaction" in error_msg:
                logger.warning(f"Transaction aborted detected in get_all(), rolling back: {error_msg}")
                try:
                    db.rollback()
                    logger.info("Rollback successful, transaction is now clean")
                except Exception as rollback_error:
                    logger.error(f"Rollback failed: {str(rollback_error)}")
                    # Force new connection by closing and reopening
                    db.close()
                    db = db.session_factory() if hasattr(db, 'session_factory') else db
        
        # Clear any stale data in session
        db.expire_all()
        
        # Main query with joinedload - use fresh query
        # First do a direct SQL count to verify data exists
        from sqlalchemy import text
        try:
            sql_count = db.execute(text("SELECT COUNT(*) FROM trade_plans")).scalar()
            logger.info(f"Direct SQL COUNT: {sql_count} plans in database")
        except Exception as sql_error:
            logger.error(f"Direct SQL count failed: {str(sql_error)}")
            sql_count = None
        
        # Now use ORM query (filtered by user_id if provided)
        query = db.query(TradePlan).options(
            joinedload(TradePlan.ticker),
            joinedload(TradePlan.account)
        )
        if user_id is not None:
            query = query.filter(TradePlan.user_id == user_id)
            logger.info(f"Applied user_id filter: {user_id}")
        plans = query.all()
        logger.info(f"Loaded {len(plans)} trade plans with joinedload (user_id={user_id})")
        
        # Verify count matches expected (filtered count if user_id provided)
        expected_count = sql_count if user_id is None else None  # We don't have filtered SQL count
        if user_id is not None:
            # For filtered queries, we can't easily verify against SQL count
            # Just trust the ORM result
            pass
        elif sql_count is not None and len(plans) != sql_count:
            logger.warning(f"⚠️ Mismatch: SQL count={sql_count}, ORM count={len(plans)}")
            # Force reload without joinedload as fallback
            db.expire_all()
            plans_fallback = db.query(TradePlan).all()
            logger.info(f"Reloaded {len(plans_fallback)} trade plans without joinedload")
            if len(plans_fallback) == sql_count:
                # Use fallback result
                plans = plans_fallback
                logger.info(f"Using fallback result with {len(plans)} plans")
        if plans:
            logger.info(f"First plan ticker: {plans[0].ticker}")
            logger.info(f"First plan account: {plans[0].account}")
        return plans
    
    @staticmethod
    def get_by_id(db: Session, plan_id: int, user_id: Optional[int] = None) -> Optional[TradePlan]:
        """Get trade plan by ID (with user_id check)"""
        query = db.query(TradePlan).options(
            joinedload(TradePlan.ticker),
            joinedload(TradePlan.account)
        ).filter(TradePlan.id == plan_id)
        if user_id is not None:
            query = query.filter(TradePlan.user_id == user_id)
        return query.first()
    
    @staticmethod
    def get_by_account(db: Session, trading_account_id: int, user_id: int) -> List[TradePlan]:
        """Get trade plans by account for a specific user (user_id is required for data isolation)"""
        query = db.query(TradePlan).filter(
            TradePlan.trading_account_id == trading_account_id,
            TradePlan.user_id == user_id
        )
        return query.all()
    
    @staticmethod
    def get_by_ticker(db: Session, ticker_id: int, user_id: Optional[int] = None) -> List[TradePlan]:
        """Get trade plans by ticker (filtered by user_id if provided)"""
        query = db.query(TradePlan).filter(TradePlan.ticker_id == ticker_id)
        if user_id is not None:
            query = query.filter(TradePlan.user_id == user_id)
        return query.all()
    
    @staticmethod
    def get_open_plans(db: Session, user_id: Optional[int] = None) -> List[TradePlan]:
        """Get open trade plans (filtered by user_id if provided)"""
        query = db.query(TradePlan).filter(TradePlan.status == 'open')
        if user_id is not None:
            query = query.filter(TradePlan.user_id == user_id)
        return query.all()
    
    @staticmethod
    def create(db: Session, data: Dict[str, Any], user_id: Optional[int] = None) -> TradePlan:
        """
        Create a new trade plan with snapshot support from existing trade.
        
        **Snapshot Pattern (2025-01-29):**
        When a trade_id is provided, this method implements the "snapshot" pattern:
        - Trade is the source when creating plan from trade
        - Planning fields (planned_amount, entry_price) are copied from the linked Trade
          as a snapshot at plan creation time
        - Explicit planning fields in data override snapshot values (allows manual override)
        
        **No Fallbacks Policy:**
        - Only uses Trade data if trade_id is provided
        - Does not use other fallback sources
        - If planning fields are missing, validation will enforce required fields
        
        Args:
            db (Session): Database session
            data (Dict[str, Any]): Trade plan data including:
                - trading_account_id (required)
                - ticker_id (required)
                - trade_id (optional) - if provided, planning fields are snapshotted from trade
                - planned_amount (optional) - overrides snapshot if provided
                - entry_price (required) - overrides snapshot if provided
                - Other standard trade plan fields (status, side, investment_type, etc.)
        
        Returns:
            TradePlan: Created trade plan entity
        
        Raises:
            ValueError: If validation fails or date format is invalid
        
        Example:
            # Create plan from trade (snapshot)
            plan = TradePlanService.create(db, {
                'trading_account_id': 1,
                'ticker_id': 2,
                'trade_id': 10  # Planning fields will be copied from trade #10
            })
            
            # Create plan with explicit planning fields (override)
            plan = TradePlanService.create(db, {
                'trading_account_id': 1,
                'ticker_id': 2,
                'trade_id': 10,
                'planned_amount': 20000,  # Overrides trade's planned_amount
                'entry_price': 200  # Overrides trade's entry_price
            })
        """
        try:
            # Convert string dates to datetime objects where needed
            if 'created_at' in data and isinstance(data['created_at'], str):
                try:
                    created_at = datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
                except ValueError:
                    try:
                        created_at = datetime.strptime(data['created_at'], '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        raise ValueError(f"Invalid date format for created_at: {data['created_at']}")
                if created_at.tzinfo is not None:
                    created_at = created_at.astimezone(timezone.utc).replace(tzinfo=None)
                data['created_at'] = created_at

            if 'cancelled_at' in data and isinstance(data['cancelled_at'], str):
                try:
                    cancelled_at = datetime.fromisoformat(data['cancelled_at'].replace('Z', '+00:00'))
                except ValueError:
                    try:
                        cancelled_at = datetime.strptime(data['cancelled_at'], '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        raise ValueError(f"Invalid date format for cancelled_at: {data['cancelled_at']}")
                if cancelled_at.tzinfo is not None:
                    cancelled_at = cancelled_at.astimezone(timezone.utc).replace(tzinfo=None)
                data['cancelled_at'] = cancelled_at

            # Snapshot planning data when a trade_id is provided (creating plan from trade)
            # This implements the "snapshot" pattern: Trade is the source when creating plan from trade
            trade_id = data.get('trade_id')
            if trade_id:
                try:
                    from models.trade import Trade
                    trade = db.query(Trade).filter(Trade.id == trade_id).first()
                except Exception as e:
                    logger.warning(f"Could not load trade {trade_id} for planning snapshot: {e}")
                    trade = None
                if trade:
                    # Only fill snapshot fields when not explicitly provided in payload
                    # This allows manual override while defaulting to trade values
                    trade_amount = getattr(trade, 'planned_amount', None)
                    trade_entry_price = getattr(trade, 'entry_price', None)
                    
                    data.setdefault('planned_amount', trade_amount)
                    data.setdefault('entry_price', trade_entry_price)
                    logger.info(f"Snapshotted planning fields from trade {trade_id}: planned_amount={trade_amount}, entry_price={trade_entry_price}")

            # Set user_id if provided and not in data
            if user_id is not None and 'user_id' not in data:
                data['user_id'] = user_id
            
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
            
            # Update user-ticker and ticker status
            try:
                from services.ticker_service import TickerService
                if plan.user_id and plan.ticker_id:
                    TickerService.update_user_ticker_status(db, plan.user_id, plan.ticker_id)
                    TickerService.update_ticker_status_auto(db, plan.ticker_id)
            except Exception as e:
                logger.warning(f"Could not update ticker status after creating trade plan: {e}")
            
            return plan
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating trade plan: {e}")
            raise
    
    @staticmethod
    def update(db: Session, plan_id: int, data: Dict[str, Any], user_id: Optional[int] = None) -> Optional[TradePlan]:
        """Update trade plan (with user_id check)"""
        try:
            query = db.query(TradePlan).filter(TradePlan.id == plan_id)
            if user_id is not None:
                query = query.filter(TradePlan.user_id == user_id)
            plan = query.first()
            if not plan:
                logger.warning(f"Trade plan {plan_id} not found for update")
                return None

            # Convert string dates to datetime objects where needed
            if 'created_at' in data and isinstance(data['created_at'], str):
                try:
                    created_at = datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
                except ValueError:
                    try:
                        created_at = datetime.strptime(data['created_at'], '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        raise ValueError(f"Invalid date format for created_at: {data['created_at']}")
                if created_at.tzinfo is not None:
                    created_at = created_at.astimezone(timezone.utc).replace(tzinfo=None)
                data['created_at'] = created_at

            if 'cancelled_at' in data and isinstance(data['cancelled_at'], str):
                try:
                    cancelled_at = datetime.fromisoformat(data['cancelled_at'].replace('Z', '+00:00'))
                except ValueError:
                    try:
                        cancelled_at = datetime.strptime(data['cancelled_at'], '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        raise ValueError(f"Invalid date format for cancelled_at: {data['cancelled_at']}")
                if cancelled_at.tzinfo is not None:
                    cancelled_at = cancelled_at.astimezone(timezone.utc).replace(tzinfo=None)
                data['cancelled_at'] = cancelled_at
            
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
            
            # Track if status changed
            old_status = plan.status
            
            for key, value in data.items():
                if hasattr(plan, key):
                    setattr(plan, key, value)
            db.commit()
            db.refresh(plan)
            logger.info(f"Updated trade plan: {plan.id}")
            
            # Update user-ticker and ticker status if status changed
            try:
                from services.ticker_service import TickerService
                if plan.user_id and plan.ticker_id and old_status != plan.status:
                    TickerService.update_user_ticker_status(db, plan.user_id, plan.ticker_id)
                    TickerService.update_ticker_status_auto(db, plan.ticker_id)
            except Exception as e:
                logger.warning(f"Could not update ticker status after updating trade plan: {e}")
            
            return plan
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating trade plan {plan_id}: {e}")
            raise
    
    @staticmethod
    def delete(db: Session, plan_id: int, user_id: Optional[int] = None) -> bool:
        """Delete trade plan (with user_id check)"""
        from models.trade import Trade
        
        query = db.query(TradePlan).filter(TradePlan.id == plan_id)
        if user_id is not None:
            query = query.filter(TradePlan.user_id == user_id)
        plan = query.first()
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
        logger.info(
            "Cancelled trade plan %s (status=%s, cancelled_at=%s)",
            plan_id,
            plan.status,
            plan.cancelled_at,
        )
        
        # Update user-ticker and ticker status
        try:
            from services.ticker_service import TickerService
            if plan.user_id and plan.ticker_id:
                TickerService.update_user_ticker_status(db, plan.user_id, plan.ticker_id)
                TickerService.update_ticker_status_auto(db, plan.ticker_id)
                logger.info(f"Updated ticker {plan.ticker_id} status after cancelling plan")
        except Exception as e:
            logger.warning(f"Could not update ticker status after cancelling plan: {e}")
        
        return plan
    
    @staticmethod
    def activate_plan(db: Session, plan_id: int) -> Optional[TradePlan]:
        """Activate trade plan"""
        plan = db.query(TradePlan).filter(TradePlan.id == plan_id).first()
        if plan and plan.cancelled_at is not None:
            plan.cancelled_at = None
            plan.cancel_reason = None
            plan.status = 'open'  # Ensure status is open when activating
            db.commit()
            db.refresh(plan)
            
            # Update user-ticker and ticker status
            try:
                from services.ticker_service import TickerService
                if plan.user_id and plan.ticker_id:
                    TickerService.update_user_ticker_status(db, plan.user_id, plan.ticker_id)
                    TickerService.update_ticker_status_auto(db, plan.ticker_id)
            except Exception as e:
                logger.warning(f"Could not update ticker status after activating plan: {e}")
            logger.info(f"Activated trade plan: {plan_id}")
            return plan
        return None
    
    @staticmethod
    def get_plan_summary(db: Session, trading_account_id: Optional[int] = None) -> Dict[str, Any]:
        """Get trade plan summary"""
        query = db.query(TradePlan)
        if trading_account_id:
            query = query.filter(TradePlan.trading_account_id == trading_account_id)
        
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
            query = query.filter(TradePlan.trading_account_id == conditions['trading_account_id'])
        
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


