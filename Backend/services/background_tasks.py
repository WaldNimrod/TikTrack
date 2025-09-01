"""
Background Tasks Service - TikTrack

This module provides background task functionality for the TikTrack system.
Includes automated cleanup, maintenance, and monitoring tasks.

Features:
- Automated data cleanup
- Database maintenance
- Cache cleanup
- Log rotation
- System monitoring

Author: TikTrack Development Team
Version: 1.0
Date: September 2025
"""

import time
import threading
try:
    import schedule
    SCHEDULE_AVAILABLE = True
except ImportError:
    SCHEDULE_AVAILABLE = False
    schedule = None
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Callable
from sqlalchemy import text
from sqlalchemy.orm import Session
from config.database import get_db
from services.cache_service import cache_service
from services.metrics_collector import metrics_collector
from services.database_optimizer import database_optimizer
from utils.performance_monitor import monitor_performance
import logging
import os

logger = logging.getLogger(__name__)

class BackgroundTaskManager:
    """
    Background task manager for TikTrack
    """
    
    def __init__(self):
        self.tasks: Dict[str, Dict[str, Any]] = {}
        self.task_history: List[Dict[str, Any]] = []
        self.max_history_size = 100
        self.running = False
        self.scheduler_thread = None
    
    def register_task(self, name: str, func: Callable, schedule_interval: str, 
                     description: str = "", enabled: bool = True) -> None:
        """
        Register a new background task
        
        Args:
            name (str): Task name
            func (Callable): Task function
            schedule_interval (str): Schedule interval (e.g., '1h', '1d', '1w')
            description (str): Task description
            enabled (bool): Whether task is enabled
        """
        self.tasks[name] = {
            'function': func,
            'schedule_interval': schedule_interval,
            'description': description,
            'enabled': enabled,
            'last_run': None,
            'next_run': None,
            'run_count': 0,
            'success_count': 0,
            'error_count': 0,
            'last_duration_ms': 0
        }
        
        logger.info(f"Registered background task: {name} ({schedule_interval})")
    
    @monitor_performance("cleanup_expired_data")
    def cleanup_expired_data(self) -> Dict[str, Any]:
        """
        Clean up expired data from database
        
        Returns:
            Dict[str, Any]: Cleanup results
        """
        start_time = time.time()
        results = {
            'timestamp': datetime.now().isoformat(),
            'cleaned_tables': {},
            'total_cleaned': 0
        }
        
        try:
            db: Session = next(get_db())
            
            # Clean up old alerts (older than 30 days)
            result = db.execute(text("""
                DELETE FROM alerts 
                WHERE created_at < datetime('now', '-30 days')
                AND status = 'inactive'
            """))
            alerts_cleaned = result.rowcount
            results['cleaned_tables']['alerts'] = alerts_cleaned
            
            # Clean up old notes (older than 90 days)
            result = db.execute(text("""
                DELETE FROM notes 
                WHERE created_at < datetime('now', '-90 days')
            """))
            notes_cleaned = result.rowcount
            results['cleaned_tables']['notes'] = notes_cleaned
            
            # Clean up old executions (older than 1 year)
            result = db.execute(text("""
                DELETE FROM executions 
                WHERE created_at < datetime('now', '-1 year')
            """))
            executions_cleaned = result.rowcount
            results['cleaned_tables']['executions'] = executions_cleaned
            
            db.commit()
            db.close()
            
            results['total_cleaned'] = alerts_cleaned + notes_cleaned + executions_cleaned
            results['success'] = True
            
            logger.info(f"Data cleanup completed: {results['total_cleaned']} records cleaned")
            
        except Exception as e:
            results['error'] = str(e)
            results['success'] = False
            logger.error(f"Error during data cleanup: {e}")
        
        results['duration_ms'] = round((time.time() - start_time) * 1000, 2)
        return results
    
    @monitor_performance("cleanup_cache")
    def cleanup_cache(self) -> Dict[str, Any]:
        """
        Clean up expired cache entries
        
        Returns:
            Dict[str, Any]: Cache cleanup results
        """
        start_time = time.time()
        
        try:
            # Clean up expired entries
            cleaned_count = cache_service.cleanup_expired()
            
            # Get cache stats
            stats = cache_service.get_stats()
            
            results = {
                'timestamp': datetime.now().isoformat(),
                'cleaned_entries': cleaned_count,
                'cache_stats': stats,
                'success': True
            }
            
            logger.info(f"Cache cleanup completed: {cleaned_count} entries cleaned")
            
        except Exception as e:
            results = {
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'success': False
            }
            logger.error(f"Error during cache cleanup: {e}")
        
        results['duration_ms'] = round((time.time() - start_time) * 1000, 2)
        return results
    
    @monitor_performance("rotate_logs")
    def rotate_logs(self) -> Dict[str, Any]:
        """
        Rotate log files
        
        Returns:
            Dict[str, Any]: Log rotation results
        """
        start_time = time.time()
        results = {
            'timestamp': datetime.now().isoformat(),
            'rotated_files': [],
            'total_size_saved_mb': 0
        }
        
        try:
            log_dir = "logs"
            if os.path.exists(log_dir):
                # Get all log files
                log_files = []
                for filename in os.listdir(log_dir):
                    if filename.endswith('.log'):
                        filepath = os.path.join(log_dir, filename)
                        file_size = os.path.getsize(filepath)
                        
                        # Rotate files larger than 10MB
                        if file_size > 10 * 1024 * 1024:  # 10MB
                            # Create backup
                            backup_name = f"{filename}.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                            backup_path = os.path.join(log_dir, backup_name)
                            
                            # Move file to backup
                            os.rename(filepath, backup_path)
                            
                            # Create new empty log file
                            with open(filepath, 'w') as f:
                                f.write(f"# Log rotated at {datetime.now().isoformat()}\n")
                            
                            results['rotated_files'].append({
                                'file': filename,
                                'backup': backup_name,
                                'size_mb': round(file_size / (1024 * 1024), 2)
                            })
                            results['total_size_saved_mb'] += file_size / (1024 * 1024)
            
            results['success'] = True
            logger.info(f"Log rotation completed: {len(results['rotated_files'])} files rotated")
            
        except Exception as e:
            results['error'] = str(e)
            results['success'] = False
            logger.error(f"Error during log rotation: {e}")
        
        results['duration_ms'] = round((time.time() - start_time) * 1000, 2)
        return results
    
    @monitor_performance("collect_metrics")
    def collect_metrics(self) -> Dict[str, Any]:
        """
        Collect system metrics
        
        Returns:
            Dict[str, Any]: Metrics collection results
        """
        start_time = time.time()
        
        try:
            # Collect all metrics
            metrics = metrics_collector.collect_all_metrics()
            
            results = {
                'timestamp': datetime.now().isoformat(),
                'metrics_collected': True,
                'metrics_count': len(metrics),
                'success': True
            }
            
            logger.info("Metrics collection completed")
            
        except Exception as e:
            results = {
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'success': False
            }
            logger.error(f"Error during metrics collection: {e}")
        
        results['duration_ms'] = round((time.time() - start_time) * 1000, 2)
        return results
    
    @monitor_performance("database_maintenance")
    def database_maintenance(self) -> Dict[str, Any]:
        """
        Perform database maintenance
        
        Returns:
            Dict[str, Any]: Maintenance results
        """
        start_time = time.time()
        
        try:
            db: Session = next(get_db())
            
            # VACUUM database
            db.execute(text("VACUUM"))
            
            # Analyze tables
            db.execute(text("ANALYZE"))
            
            # Update statistics
            db.execute(text("PRAGMA optimize"))
            
            db.commit()
            db.close()
            
            results = {
                'timestamp': datetime.now().isoformat(),
                'maintenance_completed': True,
                'operations': ['VACUUM', 'ANALYZE', 'OPTIMIZE'],
                'success': True
            }
            
            logger.info("Database maintenance completed")
            
        except Exception as e:
            results = {
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'success': False
            }
            logger.error(f"Error during database maintenance: {e}")
        
        results['duration_ms'] = round((time.time() - start_time) * 1000, 2)
        return results
    
    @monitor_performance("system_health_check")
    def system_health_check(self) -> Dict[str, Any]:
        """
        Perform system health check
        
        Returns:
            Dict[str, Any]: Health check results
        """
        start_time = time.time()
        
        try:
            # Collect metrics
            metrics = metrics_collector.collect_all_metrics()
            
            # Check system health
            system_health = 'healthy'
            warnings = []
            
            # Check CPU usage
            cpu_percent = metrics.get('performance', {}).get('system', {}).get('cpu_percent', 0)
            if cpu_percent > 80:
                system_health = 'warning'
                warnings.append(f"High CPU usage: {cpu_percent}%")
            
            # Check memory usage
            memory_percent = metrics.get('performance', {}).get('system', {}).get('memory_percent', 0)
            if memory_percent > 85:
                system_health = 'warning'
                warnings.append(f"High memory usage: {memory_percent}%")
            
            # Check disk usage
            disk_percent = metrics.get('performance', {}).get('system', {}).get('disk_percent', 0)
            if disk_percent > 90:
                system_health = 'critical'
                warnings.append(f"High disk usage: {disk_percent}%")
            
            results = {
                'timestamp': datetime.now().isoformat(),
                'system_health': system_health,
                'warnings': warnings,
                'metrics': metrics,
                'success': True
            }
            
            if warnings:
                logger.warning(f"System health check warnings: {warnings}")
            else:
                logger.info("System health check passed")
            
        except Exception as e:
            results = {
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'system_health': 'error',
                'success': False
            }
            logger.error(f"Error during system health check: {e}")
        
        results['duration_ms'] = round((time.time() - start_time) * 1000, 2)
        return results
    
    def run_task(self, task_name: str) -> Dict[str, Any]:
        """
        Run a specific task
        
        Args:
            task_name (str): Name of task to run
            
        Returns:
            Dict[str, Any]: Task execution results
        """
        if task_name not in self.tasks:
            return {
                'timestamp': datetime.now().isoformat(),
                'error': f'Task {task_name} not found',
                'success': False
            }
        
        task = self.tasks[task_name]
        if not task['enabled']:
            return {
                'timestamp': datetime.now().isoformat(),
                'error': f'Task {task_name} is disabled',
                'success': False
            }
        
        start_time = time.time()
        
        try:
            # Run the task
            result = task['function']()
            
            # Update task statistics
            task['last_run'] = datetime.now().isoformat()
            task['run_count'] += 1
            task['last_duration_ms'] = round((time.time() - start_time) * 1000, 2)
            
            if result.get('success', False):
                task['success_count'] += 1
            else:
                task['error_count'] += 1
            
            # Store in history
            history_entry = {
                'timestamp': datetime.now().isoformat(),
                'task_name': task_name,
                'result': result,
                'duration_ms': task['last_duration_ms']
            }
            self.task_history.append(history_entry)
            
            if len(self.task_history) > self.max_history_size:
                self.task_history.pop(0)
            
            logger.info(f"Task {task_name} completed successfully")
            return result
            
        except Exception as e:
            # Update task statistics
            task['last_run'] = datetime.now().isoformat()
            task['run_count'] += 1
            task['error_count'] += 1
            task['last_duration_ms'] = round((time.time() - start_time) * 1000, 2)
            
            error_result = {
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'success': False
            }
            
            logger.error(f"Error running task {task_name}: {e}")
            return error_result
    
    def start_scheduler(self) -> None:
        """Start the background task scheduler"""
        if self.running:
            logger.warning("Background task scheduler is already running")
            return
        
        self.running = True
        
        # Register default tasks
        self.register_task(
            'cleanup_expired_data',
            self.cleanup_expired_data,
            '1d',
            'Clean up expired data from database'
        )
        
        self.register_task(
            'cleanup_cache',
            self.cleanup_cache,
            '1h',
            'Clean up expired cache entries'
        )
        
        self.register_task(
            'rotate_logs',
            self.rotate_logs,
            '1w',
            'Rotate log files'
        )
        
        self.register_task(
            'collect_metrics',
            self.collect_metrics,
            '30m',
            'Collect system metrics'
        )
        
        self.register_task(
            'database_maintenance',
            self.database_maintenance,
            '1w',
            'Perform database maintenance'
        )
        
        self.register_task(
            'system_health_check',
            self.system_health_check,
            '1h',
            'Perform system health check'
        )
        
        # Schedule tasks
        if SCHEDULE_AVAILABLE:
            for task_name, task in self.tasks.items():
                if task['enabled']:
                    if task['schedule_interval'] == '30m':
                        schedule.every(30).minutes.do(self.run_task, task_name)
                    elif task['schedule_interval'] == '1h':
                        schedule.every().hour.do(self.run_task, task_name)
                    elif task['schedule_interval'] == '1d':
                        schedule.every().day.at("02:00").do(self.run_task, task_name)
                    elif task['schedule_interval'] == '1w':
                        schedule.every().sunday.at("03:00").do(self.run_task, task_name)
        else:
            logger.warning("Schedule module not available - background tasks will not be automatically scheduled")
        
        # Start scheduler thread
        self.scheduler_thread = threading.Thread(target=self._scheduler_loop, daemon=True)
        self.scheduler_thread.start()
        
        logger.info("Background task scheduler started")
    
    def stop_scheduler(self) -> None:
        """Stop the background task scheduler"""
        self.running = False
        logger.info("Background task scheduler stopped")
    
    def _scheduler_loop(self) -> None:
        """Main scheduler loop"""
        while self.running:
            try:
                if SCHEDULE_AVAILABLE:
                    schedule.run_pending()
                time.sleep(60)  # Check every minute
            except Exception as e:
                logger.error(f"Error in scheduler loop: {e}")
                time.sleep(60)
    
    def get_task_status(self) -> Dict[str, Any]:
        """
        Get status of all tasks
        
        Returns:
            Dict[str, Any]: Task status information
        """
        status = {
            'timestamp': datetime.now().isoformat(),
            'scheduler_running': self.running,
            'tasks': {}
        }
        
        for task_name, task in self.tasks.items():
            status['tasks'][task_name] = {
                'enabled': task['enabled'],
                'schedule_interval': task['schedule_interval'],
                'description': task['description'],
                'last_run': task['last_run'],
                'run_count': task['run_count'],
                'success_count': task['success_count'],
                'error_count': task['error_count'],
                'last_duration_ms': task['last_duration_ms'],
                'success_rate': round((task['success_count'] / task['run_count'] * 100) if task['run_count'] > 0 else 0, 2)
            }
        
        return status
    
    def get_task_history(self, hours: int = 24) -> List[Dict[str, Any]]:
        """
        Get task execution history
        
        Args:
            hours (int): Number of hours to look back
            
        Returns:
            List[Dict[str, Any]]: Task history
        """
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        return [
            entry for entry in self.task_history
            if datetime.fromisoformat(entry['timestamp'].replace('Z', '+00:00')) > cutoff_time
        ]

# Global background task manager instance
background_task_manager = BackgroundTaskManager()
