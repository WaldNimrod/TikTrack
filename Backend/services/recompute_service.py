from datetime import date, datetime, timedelta
from typing import Dict, List, Optional
from uuid import uuid4
import asyncio
from config.database import get_db
from Backend.models.eod_metrics_models import EODJobRuns
from Backend.services.eod_metrics_service import EODMetricsService

class RecomputeService:
    """שירות חישוב מחדש של נתוני EOD"""

    def __init__(self):
        self.db = next(get_db())
        self.eod_service = EODMetricsService()

    def recompute_user_date_range(self, user_id: int, start_date: date, end_date: date,
                                 account_ids: Optional[List[int]] = None) -> Dict[str, Any]:
        """חישוב מחדש לטווח תאריכים"""

        job_id = f"recompute_{user_id}_{start_date}_{end_date}_{uuid4().hex[:8]}"

        # יצירת job record
        job = EODJobRuns(
            job_id=job_id,
            status='queued',
            scope={
                'user_id': user_id,
                'date_range': {'start': str(start_date), 'end': str(end_date)},
                'account_ids': account_ids
            }
        )
        self.db.add(job)
        self.db.commit()

        # הפעלת ה-job ברקע
        asyncio.create_task(self._run_recompute_job_async(job_id, user_id, start_date, end_date, account_ids))

        return {
            'job_id': job_id,
            'status': 'queued',
            'message': 'Recompute job queued successfully'
        }

    async def _run_recompute_job_async(self, job_id: str, user_id: int, start_date: date,
                                      end_date: date, account_ids: Optional[List[int]]):
        """הרצת job ברקע עם asyncio"""
        start_time = datetime.now()

        try:
            # עדכון סטטוס ל-running
            self._update_job_status(job_id, 'running')

            current_date = start_date
            total_days = (end_date - start_date).days + 1
            processed_days = 0
            errors = []

            # קביעת רשימת חשבונות לעיבוד
            if account_ids:
                accounts_to_process = account_ids
            else:
                # אם לא צוין, נעבד את כל החשבונות + צבירה כוללת (None)
                accounts_to_process = self._get_user_accounts(user_id) + [None]

            while current_date <= end_date:
                try:
                    for account_id in accounts_to_process:
                        try:
                            # מחיקת נתונים קיימים ליום/חשבון
                            self._delete_existing_data(user_id, account_id, current_date)

                            # חישוב נתונים חדשים
                            metrics = self.eod_service.calculate_daily_portfolio_metrics(
                                user_id, account_id, current_date
                            )

                            # ולידציה
                            validation_errors = self.eod_service.validate_metrics(metrics)

                            # שמירה
                            self.eod_service.save_metrics(metrics, validation_errors)

                            if validation_errors:
                                errors.extend([{
                                    'date': str(current_date),
                                    'account_id': account_id,
                                    'validation_errors': validation_errors
                                }])

                        except Exception as e:
                            errors.append({
                                'date': str(current_date),
                                'account_id': account_id,
                                'error': str(e),
                                'type': 'calculation_error'
                            })

                    processed_days += 1

                except Exception as e:
                    errors.append({
                        'date': str(current_date),
                        'error': str(e),
                        'type': 'day_processing_error'
                    })

                current_date += timedelta(days=1)

            # סיכום job
            duration = (datetime.now() - start_time).seconds

            if errors:
                status = 'completed_with_errors'
            else:
                status = 'completed'

            self._update_job_status(job_id, status, errors=errors, duration=duration)

        except Exception as e:
            self._update_job_status(
                job_id,
                'failed',
                errors=[{'general_error': str(e)}]
            )

    def get_recompute_status(self, job_id: str) -> Dict[str, Any]:
        """קבלת סטטוס job"""
        job = self.db.query(EODJobRuns).filter(EODJobRuns.job_id == job_id).first()

        if not job:
            return {'error': 'Job not found'}

        result = {
            'job_id': job.job_id,
            'status': job.status,
            'scope': job.scope,
            'errors': job.errors or [],
            'duration_seconds': job.duration_seconds,
            'created_at': job.created_at.isoformat() if job.created_at else None,
            'completed_at': job.completed_at.isoformat() if job.completed_at else None
        }

        # חישוב progress אם אפשרי
        if job.scope and job.status in ['running', 'completed', 'completed_with_errors']:
            date_range = job.scope.get('date_range', {})
            if date_range.get('start') and date_range.get('end'):
                total_days = (date(end_date) - date(start_date)).days + 1
                # TODO: implement actual progress calculation
                result['total_days'] = total_days

        return result

    def get_user_jobs(self, user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """קבלת רשימת jobs של משתמש"""
        jobs = self.db.query(EODJobRuns).filter(
            EODJobRuns.scope['user_id'].as_integer() == user_id
        ).order_by(EODJobRuns.created_at.desc()).limit(limit).all()

        return [self._job_to_dict(job) for job in jobs]

    # Private helper methods
    def _get_user_accounts(self, user_id: int) -> List[int]:
        """קבלת רשימת חשבונות של משתמש"""
        # TODO: Implement actual account fetching
        # This should query the trading_accounts table
        return []

    def _delete_existing_data(self, user_id: int, account_id: Optional[int], target_date: date):
        """מחיקת נתונים קיימים לפני חישוב מחדש"""
        # Delete existing portfolio metrics
        self.db.query(DailyPortfolioMetrics).filter(
            DailyPortfolioMetrics.user_id == user_id,
            DailyPortfolioMetrics.account_id == account_id,
            DailyPortfolioMetrics.date_utc == target_date
        ).delete()

        # Delete existing positions
        self.db.query(DailyTickerPositions).filter(
            DailyTickerPositions.user_id == user_id,
            DailyTickerPositions.account_id == account_id,
            DailyTickerPositions.date_utc == target_date
        ).delete()

        # Delete existing cash flows
        self.db.query(DailyCashFlowsAgg).filter(
            DailyCashFlowsAgg.user_id == user_id,
            DailyCashFlowsAgg.account_id == account_id,
            DailyCashFlowsAgg.date_utc == target_date
        ).delete()

    def _update_job_status(self, job_id: str, status: str, errors: List[Dict] = None, duration: int = None):
        """עדכון סטטוס job"""
        job = self.db.query(EODJobRuns).filter(EODJobRuns.job_id == job_id).first()

        if job:
            job.status = status
            if errors:
                job.errors = errors
            if duration is not None:
                job.duration_seconds = duration
            if status in ['completed', 'completed_with_errors', 'failed']:
                job.completed_at = datetime.now()

            self.db.commit()

    def _job_to_dict(self, job) -> Dict[str, Any]:
        """Convert job model to dictionary"""
        result = {}
        for column in job.__table__.columns:
            value = getattr(job, column.name)
            if hasattr(value, 'isoformat'):
                value = value.isoformat()
            result[column.name] = value
        return result
