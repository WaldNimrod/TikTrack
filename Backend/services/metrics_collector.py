"""
Metrics Collection Service - TikTrack

This module provides comprehensive metrics collection functionality for the TikTrack system.
Includes performance metrics, business metrics, and system analytics.

Features:
- Performance metrics collection
- Business metrics tracking
- System analytics
- Trend analysis
- Automated reporting

Author: TikTrack Development Team
Version: 1.0
Date: September 2025
"""

import time
import psutil
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy import text, func
from sqlalchemy.orm import Session
from config.database import get_db
from services.advanced_cache_service import advanced_cache_service
from utils.performance_monitor import monitor_performance
import logging
import json

logger = logging.getLogger(__name__)

class MetricsCollector:
    """
    Comprehensive metrics collection service for TikTrack
    """
    
    def __init__(self):
        self.metrics_history: List[Dict[str, Any]] = []
        self.max_history_size = 1000
        self.collection_interval = 300  # 5 minutes
    
    @monitor_performance("collect_performance_metrics")
    def collect_performance_metrics(self) -> Dict[str, Any]:
        """
        Collect system performance metrics
        
        Returns:
            Dict[str, Any]: Performance metrics
        """
        start_time = time.time()
        
        try:
            # System metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Process metrics
            process = psutil.Process()
            process_memory = process.memory_info()
            process_cpu = process.cpu_percent()
            
            # Network metrics
            network = psutil.net_io_counters()
            
            metrics = {
                'timestamp': datetime.now().isoformat(),
                'system': {
                    'cpu_percent': round(cpu_percent, 2),
                    'memory_percent': round(memory.percent, 2),
                    'memory_available_gb': round(memory.available / (1024**3), 2),
                    'disk_percent': round(disk.percent, 2),
                    'disk_free_gb': round(disk.free / (1024**3), 2)
                },
                'process': {
                    'cpu_percent': round(process_cpu, 2),
                    'memory_mb': round(process_memory.rss / (1024**2), 2),
                    'memory_percent': round(process_memory.rss / memory.total * 100, 2)
                },
                'network': {
                    'bytes_sent': network.bytes_sent,
                    'bytes_recv': network.bytes_recv,
                    'packets_sent': network.packets_sent,
                    'packets_recv': network.packets_recv
                },
                'collection_time_ms': round((time.time() - start_time) * 1000, 2)
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error collecting performance metrics: {e}")
            return {
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'collection_time_ms': round((time.time() - start_time) * 1000, 2)
            }
    
    @monitor_performance("collect_database_metrics")
    def collect_database_metrics(self) -> Dict[str, Any]:
        """
        Collect database performance metrics
        
        Returns:
            Dict[str, Any]: Database metrics
        """
        start_time = time.time()
        
        try:
            db: Session = next(get_db())
            
            # Table sizes
            result = db.execute(text("""
                SELECT 
                    name as table_name,
                    sqlite_compileoption_used('ENABLE_FTS3') as fts_enabled
                FROM sqlite_master 
                WHERE type='table'
            """))
            tables = []
            for row in result:
                tables.append({
                    'table_name': row[0],
                    'fts_enabled': row[1]
                })
            
            # Record counts
            record_counts = {}
            for table in tables:
                table_name = table['table_name']
                if table_name != 'sqlite_sequence':
                    try:
                        result = db.execute(text(f"SELECT COUNT(*) as count FROM {table_name}"))
                        count = result.fetchone()[0]
                        record_counts[table_name] = count
                    except Exception:
                        record_counts[table_name] = 0
            
            # Database size
            result = db.execute(text("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()"))
            db_size = result.fetchone()[0]
            
            # Index information
            result = db.execute(text("SELECT COUNT(*) as index_count FROM sqlite_master WHERE type='index'"))
            index_count = result.fetchone()[0]
            
            db.close()
            
            metrics = {
                'timestamp': datetime.now().isoformat(),
                'database': {
                    'size_mb': round(db_size / (1024 * 1024), 2),
                    'table_count': len(tables),
                    'index_count': index_count,
                    'record_counts': record_counts,
                    'tables': tables
                },
                'collection_time_ms': round((time.time() - start_time) * 1000, 2)
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error collecting database metrics: {e}")
            return {
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'collection_time_ms': round((time.time() - start_time) * 1000, 2)
            }
    
    @monitor_performance("collect_business_metrics")
    def collect_business_metrics(self) -> Dict[str, Any]:
        """
        Collect business-related metrics
        
        Returns:
            Dict[str, Any]: Business metrics
        """
        start_time = time.time()
        
        try:
            db: Session = next(get_db())
            
            # Ticker metrics
            result = db.execute(text("SELECT COUNT(*) as total FROM tickers"))
            total_tickers = result.fetchone()[0]
            
            result = db.execute(text("SELECT COUNT(*) as active FROM tickers WHERE status = 'open'"))
            active_tickers = result.fetchone()[0]
            
            # Trade metrics
            result = db.execute(text("SELECT COUNT(*) as total FROM trades"))
            total_trades = result.fetchone()[0]
            
            result = db.execute(text("SELECT COUNT(*) as open FROM trades WHERE status = 'open'"))
            open_trades = result.fetchone()[0]
            
            # TradingAccount metrics
            result = db.execute(text("SELECT COUNT(*) as total FROM accounts"))
            total_accounts = result.fetchone()[0]
            
            result = db.execute(text("SELECT COUNT(*) as active FROM accounts WHERE status = 'open'"))
            active_accounts = result.fetchone()[0]
            
            # Alert metrics
            result = db.execute(text("SELECT COUNT(*) as total FROM alerts"))
            total_alerts = result.fetchone()[0]
            
            result = db.execute(text("SELECT COUNT(*) as active FROM alerts WHERE status = 'active'"))
            active_alerts = result.fetchone()[0]
            
            db.close()
            
            metrics = {
                'timestamp': datetime.now().isoformat(),
                'business': {
                    'tickers': {
                        'total': total_tickers,
                        'active': active_tickers,
                        'active_percent': round((active_tickers / total_tickers * 100) if total_tickers > 0 else 0, 2)
                    },
                    'trades': {
                        'total': total_trades,
                        'open': open_trades,
                        'open_percent': round((open_trades / total_trades * 100) if total_trades > 0 else 0, 2)
                    },
                    'accounts': {
                        'total': total_accounts,
                        'active': active_accounts,
                        'active_percent': round((active_accounts / total_accounts * 100) if total_accounts > 0 else 0, 2)
                    },
                    'alerts': {
                        'total': total_alerts,
                        'active': active_alerts,
                        'active_percent': round((active_alerts / total_alerts * 100) if total_alerts > 0 else 0, 2)
                    }
                },
                'collection_time_ms': round((time.time() - start_time) * 1000, 2)
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error collecting business metrics: {e}")
            return {
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'collection_time_ms': round((time.time() - start_time) * 1000, 2)
            }
    
    @monitor_performance("collect_cache_metrics")
    def collect_cache_metrics(self) -> Dict[str, Any]:
        """
        Collect cache performance metrics
        
        Returns:
            Dict[str, Any]: Cache metrics
        """
        start_time = time.time()
        
        try:
            stats = advanced_cache_service.get_stats()
            
            # Calculate hit rate
            hit_rate = 0.0
            if hasattr(advanced_cache_service, 'cache') and advanced_cache_service.cache:
                total_requests = len(advanced_cache_service.cache)
                if total_requests > 0:
                    hit_rate = (total_requests - stats.get('expired_entries', 0)) / total_requests
            
            metrics = {
                'timestamp': datetime.now().isoformat(),
                'cache': {
                    'total_entries': stats.get('total_entries', 0),
                    'active_entries': stats.get('active_entries', 0),
                    'expired_entries': stats.get('expired_entries', 0),
                    'memory_usage_bytes': stats.get('memory_usage', 0),
                    'hit_rate_percent': round(hit_rate * 100, 2),
                    'memory_usage_mb': round(stats.get('memory_usage', 0) / (1024 * 1024), 4)
                },
                'collection_time_ms': round((time.time() - start_time) * 1000, 2)
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error collecting cache metrics: {e}")
            return {
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'collection_time_ms': round((time.time() - start_time) * 1000, 2)
            }
    
    def collect_all_metrics(self) -> Dict[str, Any]:
        """
        Collect all metrics
        
        Returns:
            Dict[str, Any]: All metrics combined
        """
        start_time = time.time()
        
        # Collect all metrics
        performance_metrics = self.collect_performance_metrics()
        database_metrics = self.collect_database_metrics()
        business_metrics = self.collect_business_metrics()
        cache_metrics = self.collect_cache_metrics()
        
        # Combine all metrics
        all_metrics = {
            'timestamp': datetime.now().isoformat(),
            'collection_duration_ms': round((time.time() - start_time) * 1000, 2),
            'performance': performance_metrics,
            'database': database_metrics,
            'business': business_metrics,
            'cache': cache_metrics
        }
        
        # Store in history
        self.metrics_history.append(all_metrics)
        if len(self.metrics_history) > self.max_history_size:
            self.metrics_history.pop(0)
        
        return all_metrics
    
    def get_metrics_history(self, hours: int = 24) -> List[Dict[str, Any]]:
        """
        Get metrics history for the specified hours
        
        Args:
            hours (int): Number of hours to look back
            
        Returns:
            List[Dict[str, Any]]: Metrics history
        """
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        return [
            metrics for metrics in self.metrics_history
            if datetime.fromisoformat(metrics['timestamp'].replace('Z', '+00:00')) > cutoff_time
        ]
    
    def analyze_trends(self, hours: int = 24) -> Dict[str, Any]:
        """
        Analyze metrics trends
        
        Args:
            hours (int): Number of hours to analyze
            
        Returns:
            Dict[str, Any]: Trend analysis
        """
        history = self.get_metrics_history(hours)
        
        if not history:
            return {'error': 'No metrics data available'}
        
        # Calculate trends
        cpu_trends = []
        memory_trends = []
        cache_trends = []
        
        for metrics in history:
            if 'performance' in metrics and 'system' in metrics['performance']:
                cpu_trends.append(metrics['performance']['system']['cpu_percent'])
                memory_trends.append(metrics['performance']['system']['memory_percent'])
            
            if 'cache' in metrics:
                cache_trends.append(metrics['cache']['total_entries'])
        
        # Calculate averages
        avg_cpu = sum(cpu_trends) / len(cpu_trends) if cpu_trends else 0
        avg_memory = sum(memory_trends) / len(memory_trends) if memory_trends else 0
        avg_cache_entries = sum(cache_trends) / len(cache_trends) if cache_trends else 0
        
        return {
            'period_hours': hours,
            'total_metrics': len(history),
            'averages': {
                'cpu_percent': round(avg_cpu, 2),
                'memory_percent': round(avg_memory, 2),
                'cache_entries': round(avg_cache_entries, 2)
            },
            'trends': {
                'cpu_trend': 'increasing' if cpu_trends and cpu_trends[-1] > cpu_trends[0] else 'decreasing',
                'memory_trend': 'increasing' if memory_trends and memory_trends[-1] > memory_trends[0] else 'decreasing',
                'cache_trend': 'increasing' if cache_trends and cache_trends[-1] > cache_trends[0] else 'decreasing'
            }
        }
    
    def generate_report(self, hours: int = 24) -> Dict[str, Any]:
        """
        Generate comprehensive metrics report
        
        Args:
            hours (int): Number of hours to include in report
            
        Returns:
            Dict[str, Any]: Comprehensive report
        """
        current_metrics = self.collect_all_metrics()
        trends = self.analyze_trends(hours)
        
        report = {
            'generated_at': datetime.now().isoformat(),
            'period_hours': hours,
            'current_metrics': current_metrics,
            'trends': trends,
            'summary': {
                'system_health': 'healthy' if current_metrics.get('performance', {}).get('system', {}).get('cpu_percent', 0) < 80 else 'warning',
                'database_health': 'healthy' if 'database' in current_metrics else 'error',
                'cache_health': 'healthy' if 'cache' in current_metrics else 'error',
                'business_health': 'healthy' if 'business' in current_metrics else 'error'
            }
        }
        
        return report

# Global metrics collector instance
metrics_collector = MetricsCollector()
