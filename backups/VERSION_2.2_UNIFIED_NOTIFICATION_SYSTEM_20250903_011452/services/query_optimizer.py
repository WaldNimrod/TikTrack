"""
Query Optimization Service - TikTrack

This module provides optimized database queries to prevent N+1 problems
and improve performance through lazy loading and bulk operations.

Features:
- Lazy loading with joinedload
- Bulk operations for multiple records
- Query optimization utilities
- Performance monitoring

Author: TikTrack Development Team
Version: 1.0
Date: September 2025
"""

from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import text
from typing import List, Optional, Dict, Any
from models.ticker import Ticker
from models.trade import Trade
from models.trade_plan import TradePlan
from models.note import Note
from models.alert import Alert
from models.execution import Execution
from models.account import Account
from utils.performance_monitor import monitor_database_query
import logging

logger = logging.getLogger(__name__)

class QueryOptimizer:
    """
    Service for optimizing database queries
    
    This service provides optimized query methods that prevent N+1 problems
    and improve performance through proper loading strategies.
    """
    
    @staticmethod
    @monitor_database_query("get_tickers_with_related_data")
    def get_tickers_with_related_data(db: Session) -> List[Ticker]:
        """
        Get all tickers with related data using lazy loading
        
        Optimized to prevent N+1 queries by loading related data in advance
        
        Args:
            db (Session): Database session
            
        Returns:
            List[Ticker]: List of tickers with related data loaded
        """
        return db.query(Ticker).options(
            joinedload(Ticker.trades),
            joinedload(Ticker.trade_plans),
            joinedload(Ticker.alerts)
        ).all()
    
    @staticmethod
    @monitor_database_query("get_ticker_with_full_data")
    def get_ticker_with_full_data(db: Session, ticker_id: int) -> Optional[Ticker]:
        """
        Get ticker with all related data using lazy loading
        
        Args:
            db (Session): Database session
            ticker_id (int): Ticker ID
            
        Returns:
            Optional[Ticker]: Ticker with all related data or None
        """
        return db.query(Ticker).options(
            joinedload(Ticker.trades).joinedload(Trade.executions),
            joinedload(Ticker.trade_plans),
            joinedload(Ticker.alerts),
            joinedload(Ticker.currency)
        ).filter(Ticker.id == ticker_id).first()
    
    @staticmethod
    @monitor_database_query("get_trades_with_executions")
    def get_trades_with_executions(db: Session, ticker_id: Optional[int] = None) -> List[Trade]:
        """
        Get trades with executions using lazy loading
        
        Args:
            db (Session): Database session
            ticker_id (Optional[int]): Filter by ticker ID
            
        Returns:
            List[Trade]: List of trades with executions loaded
        """
        query = db.query(Trade).options(
            joinedload(Trade.executions),
            joinedload(Trade.ticker),
            joinedload(Trade.account)
        )
        
        if ticker_id:
            query = query.filter(Trade.ticker_id == ticker_id)
            
        return query.all()
    
    @staticmethod
    @monitor_database_query("get_accounts_with_trades")
    def get_accounts_with_trades(db: Session) -> List[Account]:
        """
        Get accounts with their trades using lazy loading
        
        Args:
            db (Session): Database session
            
        Returns:
            List[Account]: List of accounts with trades loaded
        """
        return db.query(Account).options(
            joinedload(Account.trades).joinedload(Trade.executions),
            joinedload(Account.currency)
        ).all()
    
    @staticmethod
    @monitor_database_query("bulk_update_tickers_status")
    def bulk_update_tickers_status(db: Session, ticker_ids: List[int], status: str) -> int:
        """
        Bulk update ticker statuses
        
        Args:
            db (Session): Database session
            ticker_ids (List[int]): List of ticker IDs to update
            status (str): New status
            
        Returns:
            int: Number of updated records
        """
        try:
            result = db.query(Ticker).filter(Ticker.id.in_(ticker_ids)).update(
                {Ticker.status: status},
                synchronize_session=False
            )
            db.commit()
            logger.info(f"Bulk updated {result} tickers to status: {status}")
            return result
        except Exception as e:
            db.rollback()
            logger.error(f"Error in bulk update: {e}")
            raise
    
    @staticmethod
    @monitor_database_query("bulk_create_tickers")
    def bulk_create_tickers(db: Session, tickers_data: List[Dict[str, Any]]) -> List[Ticker]:
        """
        Bulk create tickers
        
        Args:
            db (Session): Database session
            tickers_data (List[Dict[str, Any]]): List of ticker data dictionaries
            
        Returns:
            List[Ticker]: List of created tickers
        """
        try:
            tickers = []
            for data in tickers_data:
                ticker = Ticker(**data)
                db.add(ticker)
                tickers.append(ticker)
            
            db.commit()
            logger.info(f"Bulk created {len(tickers)} tickers")
            return tickers
        except Exception as e:
            db.rollback()
            logger.error(f"Error in bulk create: {e}")
            raise
    
    @staticmethod
    @monitor_database_query("get_tickers_by_status_optimized")
    def get_tickers_by_status_optimized(db: Session, status: str) -> List[Ticker]:
        """
        Get tickers by status with optimized query
        
        Args:
            db (Session): Database session
            status (str): Status to filter by
            
        Returns:
            List[Ticker]: List of tickers with given status
        """
        return db.query(Ticker).options(
            joinedload(Ticker.currency)
        ).filter(Ticker.status == status).all()
    
    @staticmethod
    @monitor_database_query("get_trades_summary_optimized")
    def get_trades_summary_optimized(db: Session, ticker_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Get trades summary with optimized query
        
        Args:
            db (Session): Database session
            ticker_id (Optional[int]): Filter by ticker ID
            
        Returns:
            List[Dict[str, Any]]: List of trade summaries
        """
        query = db.query(
            Trade.id,
            Trade.symbol,
            Trade.quantity,
            Trade.price,
            Trade.status,
            Ticker.name.label('ticker_name'),
            Account.name.label('account_name')
        ).join(Ticker).join(Account)
        
        if ticker_id:
            query = query.filter(Trade.ticker_id == ticker_id)
            
        return [dict(row) for row in query.all()]
    
    @staticmethod
    @monitor_database_query("get_alerts_with_tickers")
    def get_alerts_with_tickers(db: Session) -> List[Alert]:
        """
        Get alerts with ticker information using lazy loading
        
        Args:
            db (Session): Database session
            
        Returns:
            List[Alert]: List of alerts with ticker data
        """
        return db.query(Alert).options(
            joinedload(Alert.ticker),
            joinedload(Alert.related_type)
        ).all()
    
    @staticmethod
    @monitor_database_query("get_notes_with_relations")
    def get_notes_with_relations(db: Session) -> List[Note]:
        """
        Get notes with their relations using lazy loading
        
        Args:
            db (Session): Database session
            
        Returns:
            List[Note]: List of notes with relations
        """
        return db.query(Note).options(
            joinedload(Note.relations),
            joinedload(Note.relation_type)
        ).all()

class BulkOperations:
    """
    Utility class for bulk database operations
    """
    
    @staticmethod
    @monitor_database_query("bulk_insert_executions")
    def bulk_insert_executions(db: Session, executions_data: List[Dict[str, Any]]) -> List[Execution]:
        """
        Bulk insert executions
        
        Args:
            db (Session): Database session
            executions_data (List[Dict[str, Any]]): List of execution data
            
        Returns:
            List[Execution]: List of created executions
        """
        try:
            executions = []
            for data in executions_data:
                execution = Execution(**data)
                db.add(execution)
                executions.append(execution)
            
            db.commit()
            logger.info(f"Bulk inserted {len(executions)} executions")
            return executions
        except Exception as e:
            db.rollback()
            logger.error(f"Error in bulk insert executions: {e}")
            raise
    
    @staticmethod
    @monitor_database_query("bulk_update_trades_status")
    def bulk_update_trades_status(db: Session, trade_ids: List[int], status: str) -> int:
        """
        Bulk update trade statuses
        
        Args:
            db (Session): Database session
            trade_ids (List[int]): List of trade IDs to update
            status (str): New status
            
        Returns:
            int: Number of updated records
        """
        try:
            result = db.query(Trade).filter(Trade.id.in_(trade_ids)).update(
                {Trade.status: status},
                synchronize_session=False
            )
            db.commit()
            logger.info(f"Bulk updated {result} trades to status: {status}")
            return result
        except Exception as e:
            db.rollback()
            logger.error(f"Error in bulk update trades: {e}")
            raise

class QueryAnalytics:
    """
    Utility class for query performance analytics
    """
    
    @staticmethod
    def analyze_query_performance(db: Session) -> Dict[str, Any]:
        """
        Analyze database query performance
        
        Args:
            db (Session): Database session
            
        Returns:
            Dict[str, Any]: Performance analytics
        """
        try:
            # Get table sizes
            result = db.execute(text("""
                SELECT 
                    name as table_name,
                    sqlite_compileoption_used('ENABLE_FTS3') as fts_enabled,
                    sqlite_compileoption_used('ENABLE_FTS4') as fts4_enabled,
                    sqlite_compileoption_used('ENABLE_FTS5') as fts5_enabled
                FROM sqlite_master 
                WHERE type='table'
            """))
            
            tables_info = [dict(row) for row in result]
            
            # Get index information
            result = db.execute(text("""
                SELECT 
                    name as index_name,
                    tbl_name as table_name,
                    sql as index_sql
                FROM sqlite_master 
                WHERE type='index'
            """))
            
            indexes_info = [dict(row) for row in result]
            
            return {
                "tables": tables_info,
                "indexes": indexes_info,
                "total_tables": len(tables_info),
                "total_indexes": len(indexes_info)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing query performance: {e}")
            return {"error": str(e)}
