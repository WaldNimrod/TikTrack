"""
Smart Cache Warming Service - TikTrack
Intelligent cache warming system for optimal performance.

This service provides:
- Predictive cache warming based on usage patterns
- Critical data prioritization
- Peak time optimization
- Background warming tasks
- User behavior analysis

Author: TikTrack Development Team
Created: September 2025
Version: 1.0
"""

import asyncio
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
import threading
from collections import defaultdict, deque

from sqlalchemy.orm import sessionmaker
from config.database import get_session_local
from services.advanced_cache_service import advanced_cache_service, cache_with_deps
from models.ticker import Ticker
from models.trade import Trade
from models.trade_plan import TradePlan
from models.account import Account

logger = logging.getLogger(__name__)

@dataclass
class WarmingPattern:
    """Cache warming pattern definition"""
    name: str
    priority: int
    frequency_minutes: int
    data_source: str
    cache_key_pattern: str
    dependencies: List[str]
    estimated_load_time: float
    last_warmed: Optional[datetime] = None
    
@dataclass 
class UsageStatistics:
    """Usage statistics for cache warming decisions"""
    entity_type: str
    request_count: int
    avg_response_time: float
    peak_hours: List[int]
    cache_hit_rate: float
    last_updated: datetime

class SmartCacheWarmingService:
    """
    Smart cache warming service with predictive capabilities
    """
    
    def __init__(self):
        """Initialize cache warming service"""
        self.warming_patterns: Dict[str, WarmingPattern] = {}
        self.usage_stats: Dict[str, UsageStatistics] = {}
        self.warming_queue: deque = deque()
        self.warming_thread: Optional[threading.Thread] = None
        self.is_warming = False
        
        # Configuration
        self.peak_hours = [8, 9, 10, 13, 14, 15, 16]  # Business hours
        self.warming_interval = 300  # 5 minutes
        self.max_concurrent_warming = 3
        self.warming_timeout = 30  # seconds
        
        # Statistics tracking
        self.request_history = defaultdict(deque)
        self.response_times = defaultdict(deque)
        
        self._initialize_warming_patterns()
        self._start_warming_worker()
        
        logger.info("Smart Cache Warming Service initialized")
    
    def _initialize_warming_patterns(self):
        """Initialize predefined warming patterns"""
        
        patterns = [
            # Critical data - highest priority
            WarmingPattern(
                name="active_tickers",
                priority=1,
                frequency_minutes=2,
                data_source="get_active_tickers",
                cache_key_pattern="tickers:active:*",
                dependencies=["tickers", "trades"],
                estimated_load_time=0.5
            ),
            WarmingPattern(
                name="open_trades", 
                priority=1,
                frequency_minutes=3,
                data_source="get_open_trades",
                cache_key_pattern="trades:open:*",
                dependencies=["trades", "tickers"],
                estimated_load_time=0.8
            ),
            WarmingPattern(
                name="recent_executions",
                priority=2,
                frequency_minutes=5,
                data_source="get_recent_executions",
                cache_key_pattern="executions:recent:*",
                dependencies=["executions", "trades"],
                estimated_load_time=1.2
            ),
            
            # Dashboard data - medium priority  
            WarmingPattern(
                name="account_summaries",
                priority=3,
                frequency_minutes=10,
                data_source="get_account_summaries",
                cache_key_pattern="accounts:summary:*",
                dependencies=["accounts", "trades", "cash_flows"],
                estimated_load_time=2.0
            ),
            WarmingPattern(
                name="performance_metrics",
                priority=3,
                frequency_minutes=15,
                data_source="get_performance_metrics",
                cache_key_pattern="metrics:performance:*", 
                dependencies=["trades", "accounts"],
                estimated_load_time=3.0
            ),
            
            # Historical data - lower priority
            WarmingPattern(
                name="historical_trades",
                priority=4,
                frequency_minutes=30,
                data_source="get_historical_trades",
                cache_key_pattern="trades:historical:*",
                dependencies=["trades"],
                estimated_load_time=5.0
            )
        ]
        
        for pattern in patterns:
            self.warming_patterns[pattern.name] = pattern
            
        logger.info(f"Initialized {len(patterns)} warming patterns")
    
    def _start_warming_worker(self):
        """Start background warming worker thread"""
        def warming_worker():
            while True:
                try:
                    if self.is_warming:
                        self._process_warming_queue()
                        self._analyze_usage_patterns()
                        self._schedule_warming_tasks()
                    
                    time.sleep(self.warming_interval)
                    
                except Exception as e:
                    logger.error(f"Cache warming worker error: {e}")
                    time.sleep(60)  # Wait 1 minute on error
        
        self.warming_thread = threading.Thread(target=warming_worker, daemon=True)
        self.warming_thread.start()
        logger.info("Cache warming worker thread started")
    
    def start_warming(self):
        """Start cache warming process"""
        self.is_warming = True
        logger.info("Cache warming started")
    
    def stop_warming(self):
        """Stop cache warming process"""
        self.is_warming = False
        logger.info("Cache warming stopped")
    
    def track_request(self, entity_type: str, response_time: float):
        """Track request for usage analysis"""
        now = datetime.now()
        
        # Track request count
        self.request_history[entity_type].append(now)
        
        # Track response time
        self.response_times[entity_type].append(response_time)
        
        # Keep only last 1000 requests
        if len(self.request_history[entity_type]) > 1000:
            self.request_history[entity_type].popleft()
            
        if len(self.response_times[entity_type]) > 1000:
            self.response_times[entity_type].popleft()
    
    def _analyze_usage_patterns(self):
        """Analyze usage patterns to optimize warming"""
        current_hour = datetime.now().hour
        
        for entity_type in self.request_history:
            requests = self.request_history[entity_type]
            response_times = self.response_times[entity_type]
            
            if len(requests) < 10:
                continue  # Not enough data
            
            # Calculate statistics
            recent_requests = [r for r in requests if (datetime.now() - r).seconds < 3600]  # Last hour
            request_count = len(recent_requests)
            avg_response_time = sum(response_times) / len(response_times) if response_times else 0
            
            # Determine peak hours
            hour_counts = defaultdict(int)
            for req in requests:
                if (datetime.now() - req).days < 7:  # Last week
                    hour_counts[req.hour] += 1
            
            peak_hours = sorted(hour_counts.keys(), key=hour_counts.get, reverse=True)[:5]
            
            # Update usage statistics
            self.usage_stats[entity_type] = UsageStatistics(
                entity_type=entity_type,
                request_count=request_count,
                avg_response_time=avg_response_time,
                peak_hours=peak_hours,
                cache_hit_rate=0,  # Will be updated by cache service
                last_updated=datetime.now()
            )
            
        logger.debug(f"Usage patterns analyzed for {len(self.usage_stats)} entity types")
    
    def _schedule_warming_tasks(self):
        """Schedule warming tasks based on patterns and usage"""
        current_time = datetime.now()
        current_hour = current_time.hour
        is_peak_time = current_hour in self.peak_hours
        
        for pattern_name, pattern in self.warming_patterns.items():
            should_warm = False
            
            # Check if it's time to warm this pattern
            if pattern.last_warmed is None:
                should_warm = True
            else:
                time_since_last = current_time - pattern.last_warmed
                if time_since_last.total_seconds() >= pattern.frequency_minutes * 60:
                    should_warm = True
            
            # Higher priority warming during peak hours
            if is_peak_time and pattern.priority <= 2:
                should_warm = True
            
            # Check usage patterns
            entity_type = pattern.data_source.replace('get_', '').replace('_', '')
            if entity_type in self.usage_stats:
                stats = self.usage_stats[entity_type]
                # High request count = more frequent warming
                if stats.request_count > 50 and pattern.priority <= 3:
                    should_warm = True
            
            if should_warm and len(self.warming_queue) < 10:  # Limit queue size
                self.warming_queue.append(pattern_name)
                pattern.last_warmed = current_time
                logger.debug(f"Scheduled warming task: {pattern_name}")
    
    def _process_warming_queue(self):
        """Process warming queue"""
        processed_count = 0
        
        while self.warming_queue and processed_count < self.max_concurrent_warming:
            pattern_name = self.warming_queue.popleft()
            
            try:
                self._execute_warming_task(pattern_name)
                processed_count += 1
                
            except Exception as e:
                logger.error(f"Warming task failed for {pattern_name}: {e}")
        
        if processed_count > 0:
            logger.debug(f"Processed {processed_count} warming tasks")
    
    def _execute_warming_task(self, pattern_name: str):
        """Execute a single warming task"""
        pattern = self.warming_patterns.get(pattern_name)
        if not pattern:
            return
        
        start_time = time.time()
        
        try:
            # Execute the warming function based on data source
            if pattern.data_source == "get_active_tickers":
                self._warm_active_tickers()
            elif pattern.data_source == "get_open_trades":
                self._warm_open_trades()
            elif pattern.data_source == "get_recent_executions":
                self._warm_recent_executions()
            elif pattern.data_source == "get_account_summaries":
                self._warm_account_summaries()
            elif pattern.data_source == "get_performance_metrics":
                self._warm_performance_metrics()
            elif pattern.data_source == "get_historical_trades":
                self._warm_historical_trades()
            
            execution_time = time.time() - start_time
            logger.info(f"Cache warming completed for {pattern_name} in {execution_time:.2f}s")
            
        except Exception as e:
            logger.error(f"Cache warming failed for {pattern_name}: {e}")
    
    @cache_with_deps(ttl=300, dependencies=['tickers', 'trades'])
    def _warm_active_tickers(self):
        """Warm cache for active tickers"""
        session = get_session_local()
        try:
            # Get tickers with active trades
            active_tickers = session.query(Ticker).join(Trade).filter(
                Trade.status == 'open'
            ).distinct().all()
            
            return [ticker.to_dict() for ticker in active_tickers]
        finally:
            session.close()
    
    @cache_with_deps(ttl=180, dependencies=['trades'])  
    def _warm_open_trades(self):
        """Warm cache for open trades"""
        session = get_session_local()
        try:
            open_trades = session.query(Trade).filter(
                Trade.status == 'open'
            ).all()
            
            return [trade.to_dict() for trade in open_trades]
        finally:
            session.close()
    
    @cache_with_deps(ttl=600, dependencies=['executions'])
    def _warm_recent_executions(self):
        """Warm cache for recent executions"""
        session = get_session_local()
        try:
            # Get executions from last 24 hours
            yesterday = datetime.now() - timedelta(days=1)
            recent_executions = session.query(Trade).filter(
                Trade.created_at >= yesterday
            ).order_by(Trade.created_at.desc()).limit(100).all()
            
            return [execution.to_dict() for execution in recent_executions]
        finally:
            session.close()
    
    @cache_with_deps(ttl=900, dependencies=['accounts', 'trades', 'cash_flows'])
    def _warm_account_summaries(self):
        """Warm cache for account summaries"""
        session = get_session_local()
        try:
            accounts = session.query(Account).filter(
                Account.status == 'open'
            ).all()
            
            summaries = []
            for account in accounts:
                summary = {
                    'account_id': account.id,
                    'name': account.name,
                    'balance': account.balance,
                    'currency': account.currency,
                    'active_trades_count': len([t for t in account.trades if t.status == 'open']),
                    'last_updated': datetime.now().isoformat()
                }
                summaries.append(summary)
            
            return summaries
        finally:
            session.close()
    
    @cache_with_deps(ttl=1800, dependencies=['trades', 'accounts'])
    def _warm_performance_metrics(self):
        """Warm cache for performance metrics"""
        session = get_session_local()
        try:
            # Calculate performance metrics
            last_month = datetime.now() - timedelta(days=30)
            trades = session.query(Trade).filter(
                Trade.created_at >= last_month
            ).all()
            
            metrics = {
                'total_trades': len(trades),
                'profitable_trades': len([t for t in trades if t.profit_loss and t.profit_loss > 0]),
                'total_profit_loss': sum(t.profit_loss or 0 for t in trades),
                'avg_trade_duration': 0,  # To be calculated
                'win_rate': 0,
                'generated_at': datetime.now().isoformat()
            }
            
            if trades:
                metrics['win_rate'] = metrics['profitable_trades'] / len(trades) * 100
            
            return metrics
        finally:
            session.close()
    
    @cache_with_deps(ttl=3600, dependencies=['trades'])
    def _warm_historical_trades(self):
        """Warm cache for historical trades"""
        session = get_session_local()
        try:
            # Get trades from last 3 months
            three_months_ago = datetime.now() - timedelta(days=90)
            historical_trades = session.query(Trade).filter(
                Trade.created_at >= three_months_ago,
                Trade.status.in_(['closed', 'cancelled'])
            ).order_by(Trade.created_at.desc()).limit(500).all()
            
            return [trade.to_dict() for trade in historical_trades]
        finally:
            session.close()
    
    def warm_critical_data(self):
        """Manually warm critical data immediately"""
        critical_patterns = [name for name, pattern in self.warming_patterns.items() 
                           if pattern.priority <= 2]
        
        for pattern_name in critical_patterns:
            try:
                self._execute_warming_task(pattern_name)
                logger.info(f"Critical data warmed: {pattern_name}")
            except Exception as e:
                logger.error(f"Failed to warm critical data {pattern_name}: {e}")
    
    def warm_for_user_session(self, user_preferences: Dict[str, Any] = None):
        """Warm cache based on user preferences and behavior"""
        if not user_preferences:
            user_preferences = {}
        
        # Default user patterns
        default_patterns = ["active_tickers", "open_trades", "account_summaries"]
        
        # Add user-specific patterns based on preferences
        if user_preferences.get('favorite_tickers'):
            default_patterns.append("recent_executions")
        
        if user_preferences.get('show_performance_metrics', True):
            default_patterns.append("performance_metrics")
        
        for pattern_name in default_patterns:
            if pattern_name in self.warming_patterns:
                self.warming_queue.append(pattern_name)
                
        logger.info(f"User session warming scheduled: {len(default_patterns)} patterns")
    
    def add_custom_warming_pattern(self, pattern: WarmingPattern):
        """Add custom warming pattern"""
        self.warming_patterns[pattern.name] = pattern
        logger.info(f"Custom warming pattern added: {pattern.name}")
    
    def remove_warming_pattern(self, pattern_name: str):
        """Remove warming pattern"""
        if pattern_name in self.warming_patterns:
            del self.warming_patterns[pattern_name]
            logger.info(f"Warming pattern removed: {pattern_name}")
    
    def get_warming_statistics(self) -> Dict[str, Any]:
        """Get warming statistics"""
        current_time = datetime.now()
        
        stats = {
            'total_patterns': len(self.warming_patterns),
            'active_patterns': len([p for p in self.warming_patterns.values() 
                                  if p.last_warmed and 
                                  (current_time - p.last_warmed).total_seconds() < p.frequency_minutes * 60]),
            'queue_size': len(self.warming_queue),
            'is_warming_active': self.is_warming,
            'last_warming_activity': None,
            'warming_patterns': {}
        }
        
        # Add pattern details
        for name, pattern in self.warming_patterns.items():
            stats['warming_patterns'][name] = {
                'priority': pattern.priority,
                'frequency_minutes': pattern.frequency_minutes,
                'last_warmed': pattern.last_warmed.isoformat() if pattern.last_warmed else None,
                'next_warming_due': self._calculate_next_warming(pattern)
            }
        
        # Find last warming activity
        last_warmed = max([p.last_warmed for p in self.warming_patterns.values() 
                          if p.last_warmed], default=None)
        if last_warmed:
            stats['last_warming_activity'] = last_warmed.isoformat()
        
        return stats
    
    def _calculate_next_warming(self, pattern: WarmingPattern) -> Optional[str]:
        """Calculate when pattern should be warmed next"""
        if not pattern.last_warmed:
            return "Due now"
        
        next_warming = pattern.last_warmed + timedelta(minutes=pattern.frequency_minutes)
        
        if next_warming <= datetime.now():
            return "Due now"
        else:
            return next_warming.isoformat()
    
    def force_warm_pattern(self, pattern_name: str) -> bool:
        """Force immediate warming of specific pattern"""
        if pattern_name not in self.warming_patterns:
            logger.warning(f"Pattern not found: {pattern_name}")
            return False
        
        try:
            self._execute_warming_task(pattern_name)
            logger.info(f"Force warming completed: {pattern_name}")
            return True
        except Exception as e:
            logger.error(f"Force warming failed for {pattern_name}: {e}")
            return False
    
    def get_cache_warming_health(self) -> Dict[str, Any]:
        """Get cache warming system health"""
        stats = self.get_warming_statistics()
        current_time = datetime.now()
        
        health = {
            'status': 'healthy',
            'issues': [],
            'recommendations': []
        }
        
        # Check for issues
        if not self.is_warming:
            health['status'] = 'warning'
            health['issues'].append('Cache warming is disabled')
            health['recommendations'].append('Enable cache warming for better performance')
        
        if stats['queue_size'] > 20:
            health['status'] = 'warning'
            health['issues'].append('High warming queue size')
            health['recommendations'].append('Check warming patterns frequency')
        
        # Check pattern health
        overdue_patterns = []
        for name, pattern in self.warming_patterns.items():
            if pattern.priority <= 2:  # Critical patterns
                if not pattern.last_warmed:
                    overdue_patterns.append(name)
                else:
                    time_overdue = current_time - pattern.last_warmed
                    if time_overdue.total_seconds() > pattern.frequency_minutes * 60 * 1.5:  # 50% overdue
                        overdue_patterns.append(name)
        
        if overdue_patterns:
            health['status'] = 'critical' if len(overdue_patterns) > 3 else 'warning'
            health['issues'].append(f'{len(overdue_patterns)} critical patterns overdue')
            health['recommendations'].append('Reduce warming frequency or increase resources')
        
        health['overdue_patterns'] = overdue_patterns
        health['statistics'] = stats
        
        return health

# ===== GLOBAL SERVICE INSTANCE =====

# Create global service instance
cache_warming_service = SmartCacheWarmingService()

# ===== API INTEGRATION FUNCTIONS =====

def start_cache_warming():
    """Start cache warming service"""
    cache_warming_service.start_warming()

def stop_cache_warming():
    """Stop cache warming service"""  
    cache_warming_service.stop_warming()

def force_warm_all_critical():
    """Force warm all critical data"""
    cache_warming_service.warm_critical_data()

def get_warming_stats():
    """Get warming statistics"""
    return cache_warming_service.get_warming_statistics()

def track_api_request(entity_type: str, response_time: float):
    """Track API request for analysis"""
    cache_warming_service.track_request(entity_type, response_time)

def warm_for_user(user_preferences: Dict[str, Any] = None):
    """Warm cache for specific user"""
    cache_warming_service.warm_for_user_session(user_preferences)

def get_warming_health():
    """Get warming system health"""
    return cache_warming_service.get_cache_warming_health()

# ===== AUTO-START =====

# Auto-start warming service
try:
    cache_warming_service.start_warming()
    cache_warming_service.warm_critical_data()
    logger.info("Cache warming service auto-started with critical data warming")
except Exception as e:
    logger.error(f"Failed to auto-start cache warming: {e}")