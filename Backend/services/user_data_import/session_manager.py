"""
Import Session Manager - Manages import sessions lifecycle

This service handles the complete lifecycle of import sessions including
creation, status updates, data retrieval, and cleanup operations.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-27
"""

from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta, timezone
import logging
from sqlalchemy.orm import Session
from sqlalchemy import desc

from models.import_session import ImportSession
from models.trading_account import TradingAccount

logger = logging.getLogger(__name__)

class ImportSessionManager:
    """
    Manages the complete lifecycle of import sessions.
    
    This service handles:
    - Session creation and initialization
    - Status updates and tracking
    - Data retrieval and caching
    - Cleanup of old sessions
    - Session validation and error handling
    """
    
    def __init__(self, db_session: Session):
        """
        Initialize the session manager.
        
        Args:
            db_session: Database session for operations
        """
        self.db_session = db_session
    
    def create_session(self, trading_trading_account_id: int, file_name: str, 
                      provider: str, file_size: int = None, 
                      file_hash: str = None) -> Dict[str, Any]:
        """
        Create a new import session.
        
        Args:
            trading_account_id: Trading account ID
            file_name: Original file name
            provider: Provider name (e.g., 'IBKR', 'Demo')
            file_size: File size in bytes (optional)
            file_hash: File hash for deduplication (optional)
            
        Returns:
            Dict with session creation results
        """
        try:
            # Validate account exists
            account = self.db_session.query(TradingAccount).filter(
                TradingAccount.id == trading_account_id
            ).first()
            
            if not account:
                return {
                    'success': False,
                    'error': f'Trading account {trading_account_id} not found'
                }
            
            # Create new session
            session = ImportSession(
                trading_account_id=trading_account_id,
                provider=provider,
                file_name=file_name,
                file_size=file_size,
                file_hash=file_hash,
                status='created',
                created_at=datetime.now(timezone.utc)
            )
            
            self.db_session.add(session)
            self.db_session.commit()
            
            logger.info(f"✅ Created import session {session.id} for account {trading_account_id}")
            
            return {
                'success': True,
                'session_id': session.id,
                'session': session.to_dict()
            }
            
        except Exception as e:
            self.db_session.rollback()
            logger.error(f"❌ Failed to create import session: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_session(self, session_id: int) -> Optional[ImportSession]:
        """
        Get a session by ID.
        
        Args:
            session_id: Session ID
            
        Returns:
            ImportSession instance or None if not found
        """
        try:
            session = self.db_session.query(ImportSession).filter(
                ImportSession.id == session_id
            ).first()
            
            if session:
                logger.debug(f"Retrieved session {session_id}")
            else:
                logger.warning(f"Session {session_id} not found")
            
            return session
            
        except Exception as e:
            logger.error(f"Failed to get session {session_id}: {str(e)}")
            return None
    
    def update_session_status(self, session_id: int, status: str, 
                            error_message: str = None) -> bool:
        """
        Update session status.
        
        Args:
            session_id: Session ID
            status: New status ('created', 'analyzing', 'ready', 'importing', 'completed', 'failed')
            error_message: Optional error message for failed sessions
            
        Returns:
            True if updated successfully, False otherwise
        """
        try:
            session = self.get_session(session_id)
            if not session:
                return False
            
            old_status = session.status
            status_changed = session.update_status(status)
            if not status_changed and old_status != status:
                return False

            if status == 'failed' and error_message:
                session.add_summary_data({'error_message': error_message})

            self.db_session.commit()
            
            logger.info(f"✅ Updated session {session_id} status: {old_status} → {status}")
            return True
            
        except Exception as e:
            self.db_session.rollback()
            logger.error(f"❌ Failed to update session {session_id} status: {str(e)}")
            return False
    
    def update_session_data(self, session_id: int, 
                           total_records: int = None,
                           imported_records: int = None,
                           skipped_records: int = None,
                           summary_data: Dict[str, Any] = None) -> bool:
        """
        Update session data fields.
        
        Args:
            session_id: Session ID
            total_records: Total number of records processed
            imported_records: Number of records imported
            skipped_records: Number of records skipped
            summary_data: Additional summary data
            
        Returns:
            True if updated successfully, False otherwise
        """
        try:
            session = self.get_session(session_id)
            if not session:
                return False
            
            # Update fields if provided
            if total_records is not None:
                session.total_records = total_records
            if imported_records is not None:
                session.imported_records = imported_records
            if skipped_records is not None:
                session.skipped_records = skipped_records
            if summary_data is not None:
                session.add_summary_data(summary_data)
            
            self.db_session.commit()
            
            logger.debug(f"Updated session {session_id} data")
            return True
            
        except Exception as e:
            self.db_session.rollback()
            logger.error(f"❌ Failed to update session {session_id} data: {str(e)}")
            return False
    
    def get_session_summary(self, session_id: int) -> Optional[Dict[str, Any]]:
        """
        Get session summary with cached data.
        
        Args:
            session_id: Session ID
            
        Returns:
            Session summary dictionary or None if not found
        """
        try:
            session = self.get_session(session_id)
            if not session:
                return None
            
            # Get summary data from cache first
            summary_data = None
            try:
                from services.advanced_cache_service import advanced_cache_service
                cache_key = f"import_session_{session_id}_summary"
                summary_data = advanced_cache_service.get(cache_key)
                if summary_data:
                    logger.debug(f"Retrieved summary from cache: {cache_key}")
            except Exception as e:
                logger.debug(f"Cache retrieval failed: {str(e)}")
            
            # Fallback to database
            if not summary_data and session.summary_data:
                summary_data = session.summary_data
                logger.debug(f"Retrieved summary from database")
            
            # Build summary
            summary = {
                'session_id': session.id,
                'trading_account_id': session.trading_account_id,
                'provider': session.provider,
                'file_name': session.file_name,
                'file_size': session.file_size,
                'file_hash': session.file_hash,
                'status': session.status,
                'total_records': session.total_records,
                'imported_records': session.imported_records,
                'skipped_records': session.skipped_records,
                'created_at': session.created_at.isoformat() if session.created_at else None,
                'completed_at': session.completed_at.isoformat() if session.completed_at else None,
                'summary_data': summary_data
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"❌ Failed to get session summary {session_id}: {str(e)}")
            return None
    
    def get_sessions_by_account(self, trading_account_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get sessions for a specific account.
        
        Args:
            trading_account_id: Trading account ID
            limit: Maximum number of sessions to return
            
        Returns:
            List of session dictionaries
        """
        try:
            sessions = self.db_session.query(ImportSession).filter(
                ImportSession.trading_account_id == trading_account_id
            ).order_by(desc(ImportSession.created_at)).limit(limit).all()
            
            return [session.to_dict() for session in sessions]
            
        except Exception as e:
            logger.error(f"❌ Failed to get sessions for account {trading_account_id}: {str(e)}")
            return []
    
    def get_sessions_by_status(self, status: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get sessions by status.
        
        Args:
            status: Session status to filter by
            limit: Maximum number of sessions to return
            
        Returns:
            List of session dictionaries
        """
        try:
            sessions = self.db_session.query(ImportSession).filter(
                ImportSession.status == status
            ).order_by(desc(ImportSession.created_at)).limit(limit).all()
            
            return [session.to_dict() for session in sessions]
            
        except Exception as e:
            logger.error(f"❌ Failed to get sessions by status {status}: {str(e)}")
            return []
    
    def get_latest_active_session(self, statuses: Optional[List[str]] = None) -> Optional[ImportSession]:
        """
        Get the latest active import session (ready/importing/analyzing).
        
        Excludes completed, failed, and cancelled sessions.
        Also excludes very old sessions (older than 24 hours) that are stuck in analyzing/ready state.
        Excludes legacy sessions without created_at timestamp.
        
        This method implements smart filtering to prevent old stuck sessions from being
        returned as active, ensuring users don't see stale import sessions.
        
        Args:
            statuses: Optional list of statuses to consider active.
                     Defaults to ['importing', 'ready', 'analyzing'].
            
        Returns:
            ImportSession instance or None if no active session found.
            
        Examples:
            >>> manager = ImportSessionManager(db_session)
            >>> session = manager.get_latest_active_session()
            >>> if session:
            ...     print(f"Active session: {session.id}")
            
        Note:
            - Only returns sessions created in the last 24 hours
            - Excludes sessions without created_at (legacy sessions)
            - Excludes completed, failed, and cancelled sessions
            
        See Also:
            - cleanup_old_sessions() for periodic cleanup
            - ImportSession.status for valid status values
            
        Updated:
            January 2025 - Added filtering for old sessions and legacy sessions
        """
        try:
            active_statuses = statuses or ['importing', 'ready', 'analyzing']
            
            # Exclude completed, failed, and cancelled sessions
            excluded_statuses = ['completed', 'failed', 'cancelled']
            
            # Also exclude very old sessions (older than 24 hours) that are stuck
            from datetime import datetime, timedelta
            cutoff_time = datetime.now() - timedelta(hours=24)
            
            session = self.db_session.query(ImportSession).filter(
                ImportSession.status.in_(active_statuses),
                ~ImportSession.status.in_(excluded_statuses),
                # Only include sessions created in the last 24 hours
                # Exclude sessions without created_at (they are old legacy sessions)
                ImportSession.created_at.isnot(None),
                ImportSession.created_at >= cutoff_time
            ).order_by(desc(ImportSession.id)).first()
            
            if session:
                logger.debug(f"Retrieved latest active session {session.id} with status {session.status}")
            else:
                logger.debug("No active import sessions found")
            
            return session
        
        except Exception as e:
            logger.error(f"❌ Failed to get latest active session: {str(e)}")
            return None
    
    def cleanup_old_sessions(self, days: int = 30) -> int:
        """
        Clean up old sessions and their data.
        
        Args:
            days: Number of days to keep sessions
            
        Returns:
            Number of sessions cleaned up
        """
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            
            # Find old sessions
            old_sessions = self.db_session.query(ImportSession).filter(
                ImportSession.created_at < cutoff_date
            ).all()
            
            cleaned_count = 0
            
            for session in old_sessions:
                try:
                    # Clean up cache entries
                    try:
                        from services.advanced_cache_service import advanced_cache_service
                        cache_keys = [
                            f"import_session_{session.id}_summary",
                            f"import_session_{session.id}_analysis",
                            f"import_session_{session.id}_preview"
                        ]
                        for key in cache_keys:
                            advanced_cache_service.delete(key)
                    except Exception as e:
                        logger.debug(f"Cache cleanup failed for session {session.id}: {str(e)}")
                    
                    # Delete session
                    self.db_session.delete(session)
                    cleaned_count += 1
                    
                except Exception as e:
                    logger.error(f"Failed to clean up session {session.id}: {str(e)}")
            
            self.db_session.commit()
            
            logger.info(f"✅ Cleaned up {cleaned_count} old sessions")
            return cleaned_count
            
        except Exception as e:
            self.db_session.rollback()
            logger.error(f"❌ Failed to cleanup old sessions: {str(e)}")
            return 0
    
    def get_session_stats(self) -> Dict[str, Any]:
        """
        Get overall session statistics.
        
        Returns:
            Dictionary with session statistics
        """
        try:
            total_sessions = self.db_session.query(ImportSession).count()
            
            status_counts = {}
            for status in ['created', 'analyzing', 'ready', 'importing', 'completed', 'failed']:
                count = self.db_session.query(ImportSession).filter(
                    ImportSession.status == status
                ).count()
                status_counts[status] = count
            
            # Recent activity (last 7 days)
            recent_cutoff = datetime.now() - timedelta(days=7)
            recent_sessions = self.db_session.query(ImportSession).filter(
                ImportSession.created_at >= recent_cutoff
            ).count()
            
            return {
                'total_sessions': total_sessions,
                'status_counts': status_counts,
                'recent_sessions_7_days': recent_sessions,
                'cleanup_threshold_days': 30
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get session stats: {str(e)}")
            return {
                'total_sessions': 0,
                'status_counts': {},
                'recent_sessions_7_days': 0,
                'cleanup_threshold_days': 30
            }

