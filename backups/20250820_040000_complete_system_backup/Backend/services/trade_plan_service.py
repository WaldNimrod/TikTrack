from sqlalchemy.orm import Session, joinedload
from models.trade_plan import TradePlan
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class TradePlanService:
    @staticmethod
    def get_all(db: Session) -> List[TradePlan]:
        """קבלת כל תוכניות הטרייד"""
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
        """קבלת תוכנית טרייד לפי מזהה"""
        return db.query(TradePlan).options(
            joinedload(TradePlan.ticker),
            joinedload(TradePlan.account)
        ).filter(TradePlan.id == plan_id).first()
    
    @staticmethod
    def get_by_account(db: Session, account_id: int) -> List[TradePlan]:
        """קבלת תוכניות טרייד לפי חשבון"""
        return db.query(TradePlan).filter(TradePlan.account_id == account_id).all()
    
    @staticmethod
    def get_by_ticker(db: Session, ticker_id: int) -> List[TradePlan]:
        """קבלת תוכניות טרייד לפי טיקר"""
        return db.query(TradePlan).filter(TradePlan.ticker_id == ticker_id).all()
    
    @staticmethod
    def get_open_plans(db: Session) -> List[TradePlan]:
        """קבלת תוכניות טרייד פתוחות"""
        return db.query(TradePlan).filter(TradePlan.status == 'open').all()
    
    @staticmethod
    def create(db: Session, data: Dict[str, Any]) -> TradePlan:
        """יצירת תוכנית טרייד חדשה"""
        plan = TradePlan(**data)
        db.add(plan)
        db.commit()
        db.refresh(plan)
        logger.info(f"Created trade plan: {plan.id} for ticker {plan.ticker_id}")
        return plan
    
    @staticmethod
    def update(db: Session, plan_id: int, data: Dict[str, Any]) -> Optional[TradePlan]:
        """עדכון תוכנית טרייד"""
        plan = db.query(TradePlan).filter(TradePlan.id == plan_id).first()
        if plan:
            for key, value in data.items():
                if hasattr(plan, key):
                    setattr(plan, key, value)
            db.commit()
            db.refresh(plan)
            logger.info(f"Updated trade plan: {plan.id}")
            return plan
        return None
    
    @staticmethod
    def delete(db: Session, plan_id: int) -> bool:
        """מחיקת תוכנית טרייד"""
        plan = db.query(TradePlan).filter(TradePlan.id == plan_id).first()
        if plan:
            db.delete(plan)
            db.commit()
            logger.info(f"Deleted trade plan: {plan_id}")
            return True
        return False
    
    @staticmethod
    def cancel_plan(db: Session, plan_id: int, cancel_reason: str) -> Optional[TradePlan]:
        """ביטול תוכנית טרייד"""
        plan = db.query(TradePlan).filter(TradePlan.id == plan_id).first()
        if plan and plan.canceled_at is None:
            plan.canceled_at = datetime.utcnow()
            plan.cancel_reason = cancel_reason
            db.commit()
            db.refresh(plan)
            logger.info(f"Cancelled trade plan: {plan_id}")
            return plan
        return None
    
    @staticmethod
    def activate_plan(db: Session, plan_id: int) -> Optional[TradePlan]:
        """הפעלת תוכנית טרייד"""
        plan = db.query(TradePlan).filter(TradePlan.id == plan_id).first()
        if plan and plan.canceled_at is not None:
            plan.canceled_at = None
            plan.cancel_reason = None
            db.commit()
            db.refresh(plan)
            logger.info(f"Activated trade plan: {plan_id}")
            return plan
        return None
    
    @staticmethod
    def get_plan_summary(db: Session, account_id: Optional[int] = None) -> Dict[str, Any]:
        """קבלת סיכום תוכניות טרייד"""
        query = db.query(TradePlan)
        if account_id:
            query = query.filter(TradePlan.account_id == account_id)
        
        plans = query.all()
        
        total_plans = len(plans)
        open_plans = len([p for p in plans if p.status == 'open'])
        closed_plans = len([p for p in plans if p.status == 'closed'])
        cancelled_plans = len([p for p in plans if p.status == 'cancelled'])
        
        # חישוב סכומים
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
        """קבלת תוכניות לפי סוג השקעה"""
        return db.query(TradePlan).filter(
            TradePlan.investment_type == investment_type,
            TradePlan.status == 'open'
        ).all()
    
    @staticmethod
    def get_plans_with_conditions(db: Session, conditions: Dict[str, Any]) -> List[TradePlan]:
        """קבלת תוכניות עם תנאים מותאמים"""
        query = db.query(TradePlan)
        
        if 'account_id' in conditions:
            query = query.filter(TradePlan.account_id == conditions['account_id'])
        
        if 'ticker_id' in conditions:
            query = query.filter(TradePlan.ticker_id == conditions['ticker_id'])
        
        if 'investment_type' in conditions:
            query = query.filter(TradePlan.investment_type == conditions['investment_type'])
        
        if conditions.get('open_only', True):
            query = query.filter(TradePlan.status == 'open')
        
        return query.all()
