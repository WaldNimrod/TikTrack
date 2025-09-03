"""
Smart Query Optimizer Service - TikTrack
Intelligent query optimization system with automatic N+1 detection and performance improvements.

This service provides:
- Automatic N+1 query detection
- Smart eager loading
- Query performance profiling
- Automatic optimization suggestions
- Performance monitoring

Author: TikTrack Development Team
Created: September 2025
Version: 1.0
"""

import time
import logging
from typing import Dict, Any, List, Optional, Tuple, Union
from sqlalchemy.orm import Query, joinedload, selectinload, subqueryload, contains_eager
from sqlalchemy import text, inspect, select
from sqlalchemy.sql import Select
from dataclasses import dataclass
from datetime import datetime
import json

logger = logging.getLogger(__name__)


@dataclass
class QueryProfile:
    """Query performance profile"""
    query_hash: str
    sql: str
    execution_time: float
    row_count: int
    memory_usage: float
    optimization_suggestions: List[str]
    created_at: datetime
    execution_count: int = 1


@dataclass
class OptimizationResult:
    """Result of query optimization"""
    original_query: Query
    optimized_query: Query
    optimizations_applied: List[str]
    estimated_improvement: float
    confidence_level: float


class SmartQueryOptimizer:
    """
    Smart query optimizer with automatic N+1 detection and performance improvements.
    
    Features:
    - Automatic N+1 query detection
    - Smart eager loading recommendations
    - Query performance profiling
    - Automatic optimization
    - Performance monitoring
    """
    
    def __init__(self):
        self.query_profiles: Dict[str, QueryProfile] = {}
        self.optimization_patterns: Dict[str, Dict[str, Any]] = {}
        self.performance_thresholds = {
            'slow_query_threshold': 1.0,  # seconds
            'n_plus_one_threshold': 0.1,  # seconds per iteration
            'memory_threshold': 50.0,  # MB
            'row_count_threshold': 1000
        }
        
        # Initialize optimization patterns
        self._initialize_optimization_patterns()
        logger.info("Smart Query Optimizer initialized")
    
    def _initialize_optimization_patterns(self):
        """Initialize common optimization patterns"""
        self.optimization_patterns = {
            'ticker_queries': {
                'relationships': ['trades', 'trade_plans', 'quotes'],
                'eager_loading': ['trades', 'trade_plans'],
                'selective_loading': ['quotes']
            },
            'trade_queries': {
                'relationships': ['ticker', 'account', 'executions', 'notes'],
                'eager_loading': ['ticker', 'account'],
                'selective_loading': ['executions', 'notes']
            },
            'account_queries': {
                'relationships': ['trades', 'cash_flows', 'preferences'],
                'eager_loading': ['preferences'],
                'selective_loading': ['trades', 'cash_flows']
            },
            'execution_queries': {
                'relationships': ['trade', 'ticker'],
                'eager_loading': ['trade', 'ticker'],
                'selective_loading': []
            }
        }
    
    def optimize_query(self, query: Query, expected_usage: str = 'read', 
                      context: str = None) -> OptimizationResult:
        """
        Optimize a query based on expected usage and context.
        
        Args:
            query: SQLAlchemy query to optimize
            expected_usage: Expected usage ('read', 'write', 'count')
            context: Query context for pattern matching
            
        Returns:
            OptimizationResult with optimized query and suggestions
        """
        try:
            start_time = time.time()
            
            # Analyze query structure
            analysis = self._analyze_query(query)
            
            # Detect N+1 queries
            n_plus_one_detected = self._detect_n_plus_one(query, analysis)
            
            # Apply optimizations
            optimized_query = self._apply_optimizations(query, analysis, context)
            
            # Calculate improvement estimate
            improvement = self._estimate_improvement(analysis, n_plus_one_detected)
            
            # Create optimization result
            result = OptimizationResult(
                original_query=query,
                optimized_query=optimized_query,
                optimizations_applied=analysis.get('suggestions', []),
                estimated_improvement=improvement,
                confidence_level=self._calculate_confidence(analysis)
            )
            
            execution_time = time.time() - start_time
            logger.debug(f"Query optimization completed in {execution_time:.3f}s")
            
            return result
            
        except Exception as e:
            logger.error(f"Query optimization failed: {e}")
            # Return original query if optimization fails
            return OptimizationResult(
                original_query=query,
                optimized_query=query,
                optimizations_applied=[],
                estimated_improvement=0.0,
                confidence_level=0.0
            )
    
    def _analyze_query(self, query: Query) -> Dict[str, Any]:
        """Analyze query structure and identify optimization opportunities"""
        try:
            # Get query SQL
            sql = str(query.compile(compile_kwargs={"literal_binds": True}))
            
            # Analyze relationships
            relationships = self._extract_relationships(query)
            
            # Detect potential issues
            issues = self._detect_potential_issues(query, sql)
            
            # Generate suggestions
            suggestions = self._generate_suggestions(relationships, issues)
            
            return {
                'sql': sql,
                'relationships': relationships,
                'issues': issues,
                'suggestions': suggestions,
                'complexity_score': self._calculate_complexity_score(query)
            }
            
        except Exception as e:
            logger.error(f"Query analysis failed: {e}")
            return {'error': str(e)}
    
    def _extract_relationships(self, query: Query) -> List[str]:
        """Extract relationships from query"""
        relationships = []
        
        try:
            # Get query entity
            entity = query._entity_from_pre_ent_zero()
            if hasattr(entity, 'mapper'):
                mapper = entity.mapper
                
                # Get all relationships
                for rel in mapper.relationships:
                    relationships.append(rel.key)
                    
        except Exception as e:
            logger.debug(f"Could not extract relationships: {e}")
        
        return relationships
    
    def _detect_potential_issues(self, query: Query, sql: str) -> List[str]:
        """Detect potential performance issues in query"""
        issues = []
        
        # Check for SELECT *
        if 'SELECT *' in sql.upper():
            issues.append('select_all_columns')
        
        # Check for complex joins
        if sql.upper().count('JOIN') > 3:
            issues.append('complex_joins')
        
        # Check for subqueries
        if sql.upper().count('SELECT') > 1:
            issues.append('subqueries')
        
        # Check for ORDER BY without LIMIT
        if 'ORDER BY' in sql.upper() and 'LIMIT' not in sql.upper():
            issues.append('unlimited_ordering')
        
        return issues
    
    def _detect_n_plus_one(self, query: Query, analysis: Dict[str, Any]) -> bool:
        """Detect N+1 query patterns"""
        try:
            # Check if query is likely to cause N+1
            relationships = analysis.get('relationships', [])
            
            # Simple heuristic: if query has relationships but no eager loading
            if relationships and not self._has_eager_loading(query):
                return True
            
            # Check for common N+1 patterns
            sql = analysis.get('sql', '').upper()
            if any(pattern in sql for pattern in ['WHERE', 'IN (', 'EXISTS']):
                if relationships:
                    return True
            
            return False
            
        except Exception as e:
            logger.debug(f"N+1 detection failed: {e}")
            return False
    
    def _has_eager_loading(self, query: Query) -> bool:
        """Check if query has eager loading options"""
        try:
            # Check for various eager loading options
            return any([
                hasattr(query, '_with_options'),
                hasattr(query, '_join_entities'),
                hasattr(query, '_from_obj')
            ])
        except:
            return False
    
    def _apply_optimizations(self, query: Query, analysis: Dict[str, Any], 
                            context: str = None) -> Query:
        """Apply optimizations to query"""
        optimized_query = query
        
        try:
            # Apply eager loading if needed
            if analysis.get('relationships'):
                optimized_query = self._apply_eager_loading(
                    optimized_query, 
                    analysis['relationships'], 
                    context
                )
            
            # Apply selective loading
            if context and context in self.optimization_patterns:
                pattern = self.optimization_patterns[context]
                optimized_query = self._apply_selective_loading(
                    optimized_query, 
                    pattern
                )
            
            # Apply other optimizations
            optimized_query = self._apply_general_optimizations(optimized_query, analysis)
            
        except Exception as e:
            logger.error(f"Failed to apply optimizations: {e}")
            return query
        
        return optimized_query
    
    def _apply_eager_loading(self, query: Query, relationships: List[str], 
                            context: str = None) -> Query:
        """Apply appropriate eager loading strategy"""
        try:
            # Use context-specific patterns if available
            if context and context in self.optimization_patterns:
                pattern = self.optimization_patterns[context]
                eager_relationships = pattern.get('eager_loading', [])
                
                for rel in eager_relationships:
                    if rel in relationships:
                        query = query.options(joinedload(rel))
                
                # Apply selective loading for other relationships
                selective_relationships = pattern.get('selective_loading', [])
                for rel in selective_relationships:
                    if rel in relationships:
                        query = query.options(selectinload(rel))
            else:
                # Default strategy: use selectinload for most relationships
                for rel in relationships[:3]:  # Limit to first 3 relationships
                    query = query.options(selectinload(rel))
            
        except Exception as e:
            logger.error(f"Failed to apply eager loading: {e}")
        
        return query
    
    def _apply_selective_loading(self, query: Query, pattern: Dict[str, Any]) -> Query:
        """Apply selective loading based on pattern"""
        try:
            # Apply selective loading for specified relationships
            selective_relationships = pattern.get('selective_loading', [])
            
            for rel in selective_relationships:
                # Use selectinload for better performance with large datasets
                query = query.options(selectinload(rel))
                
        except Exception as e:
            logger.error(f"Failed to apply selective loading: {e}")
        
        return query
    
    def _apply_general_optimizations(self, query: Query, analysis: Dict[str, Any]) -> Query:
        """Apply general query optimizations"""
        try:
            # Add LIMIT if ORDER BY exists without LIMIT
            if 'ORDER BY' in analysis.get('sql', '').upper() and 'LIMIT' not in analysis.get('sql', '').upper():
                # Note: This is a simplified approach - in practice, you'd need more context
                pass
            
            # Other general optimizations can be added here
            
        except Exception as e:
            logger.error(f"Failed to apply general optimizations: {e}")
        
        return query
    
    def _estimate_improvement(self, analysis: Dict[str, Any], n_plus_one_detected: bool) -> float:
        """Estimate performance improvement from optimizations"""
        improvement = 0.0
        
        try:
            # Base improvement for relationship optimization
            if analysis.get('relationships'):
                improvement += 0.2  # 20% base improvement
            
            # Additional improvement for N+1 detection
            if n_plus_one_detected:
                improvement += 0.4  # 40% additional improvement
            
            # Improvement for issue fixes
            issues = analysis.get('issues', [])
            improvement += len(issues) * 0.1  # 10% per issue fixed
            
            # Cap improvement at 80%
            improvement = min(improvement, 0.8)
            
        except Exception as e:
            logger.error(f"Failed to estimate improvement: {e}")
        
        return improvement
    
    def _calculate_confidence(self, analysis: Dict[str, Any]) -> float:
        """Calculate confidence level in optimization suggestions"""
        confidence = 0.5  # Base confidence
        
        try:
            # Higher confidence for well-defined patterns
            if analysis.get('relationships'):
                confidence += 0.2
            
            # Higher confidence for specific issues
            if analysis.get('issues'):
                confidence += 0.2
            
            # Lower confidence for complex queries
            complexity = analysis.get('complexity_score', 0)
            if complexity > 0.7:
                confidence -= 0.2
            
            # Ensure confidence is between 0 and 1
            confidence = max(0.0, min(1.0, confidence))
            
        except Exception as e:
            logger.error(f"Failed to calculate confidence: {e}")
            confidence = 0.0
        
        return confidence
    
    def _calculate_complexity_score(self, query: Query) -> float:
        """Calculate query complexity score (0-1)"""
        try:
            score = 0.0
            
            # Check for joins
            if hasattr(query, '_join_entities') and query._join_entities:
                score += 0.3
            
            # Check for subqueries
            sql = str(query.compile(compile_kwargs={"literal_binds": True}))
            if sql.upper().count('SELECT') > 1:
                score += 0.3
            
            # Check for complex WHERE clauses
            if sql.upper().count('WHERE') > 2:
                score += 0.2
            
            # Check for aggregations
            if any(func in sql.upper() for func in ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN']):
                score += 0.2
            
            return min(score, 1.0)
            
        except Exception as e:
            logger.error(f"Failed to calculate complexity score: {e}")
            return 0.5
    
    def profile_query(self, query: Query, execution_time: float, 
                     row_count: int = 0, memory_usage: float = 0.0) -> str:
        """
        Profile a query execution and store performance data.
        
        Args:
            query: Executed query
            execution_time: Query execution time in seconds
            row_count: Number of rows returned
            memory_usage: Estimated memory usage in MB
            
        Returns:
            Query profile hash for future reference
        """
        try:
            # Generate query hash
            query_hash = self._generate_query_hash(query)
            
            # Create or update profile
            if query_hash in self.query_profiles:
                profile = self.query_profiles[query_hash]
                profile.execution_count += 1
                profile.execution_time = (profile.execution_time + execution_time) / 2
                profile.row_count = max(profile.row_count, row_count)
                profile.memory_usage = max(profile.memory_usage, memory_usage)
            else:
                # Analyze query for optimization suggestions
                analysis = self._analyze_query(query)
                
                profile = QueryProfile(
                    query_hash=query_hash,
                    sql=str(query.compile(compile_kwargs={"literal_binds": True})),
                    execution_time=execution_time,
                    row_count=row_count,
                    memory_usage=memory_usage,
                    optimization_suggestions=analysis.get('suggestions', []),
                    created_at=datetime.utcnow()
                )
                self.query_profiles[query_hash] = profile
            
            # Log slow queries
            if execution_time > self.performance_thresholds['slow_query_threshold']:
                logger.warning(f"Slow query detected: {execution_time:.3f}s - {profile.sql[:100]}...")
            
            return query_hash
            
        except Exception as e:
            logger.error(f"Query profiling failed: {e}")
            return ""
    
    def _generate_query_hash(self, query: Query) -> str:
        """Generate unique hash for query"""
        try:
            # Create a simplified representation of the query
            sql = str(query.compile(compile_kwargs={"literal_binds": True}))
            
            # Remove literal values for consistent hashing
            import re
            sql_normalized = re.sub(r"'[^']*'", "'VALUE'", sql)
            sql_normalized = re.sub(r'\d+', 'NUMBER', sql_normalized)
            
            # Generate hash
            import hashlib
            return hashlib.md5(sql_normalized.encode()).hexdigest()
            
        except Exception as e:
            logger.error(f"Failed to generate query hash: {e}")
            return ""
    
    def get_performance_report(self) -> Dict[str, Any]:
        """Get comprehensive performance report"""
        try:
            total_queries = len(self.query_profiles)
            slow_queries = sum(1 for p in self.query_profiles.values() 
                             if p.execution_time > self.performance_thresholds['slow_query_threshold'])
            
            avg_execution_time = sum(p.execution_time for p in self.query_profiles.values()) / total_queries if total_queries > 0 else 0
            
            # Top slow queries
            top_slow_queries = sorted(
                self.query_profiles.values(),
                key=lambda x: x.execution_time,
                reverse=True
            )[:5]
            
            return {
                'total_queries': total_queries,
                'slow_queries': slow_queries,
                'avg_execution_time': avg_execution_time,
                'top_slow_queries': [
                    {
                        'sql': p.sql[:100] + '...' if len(p.sql) > 100 else p.sql,
                        'execution_time': p.execution_time,
                        'execution_count': p.execution_count,
                        'suggestions': p.optimization_suggestions
                    }
                    for p in top_slow_queries
                ],
                'optimization_opportunities': self._identify_optimization_opportunities()
            }
            
        except Exception as e:
            logger.error(f"Failed to generate performance report: {e}")
            return {'error': str(e)}
    
    def _identify_optimization_opportunities(self) -> List[Dict[str, Any]]:
        """Identify queries with optimization opportunities"""
        opportunities = []
        
        try:
            for profile in self.query_profiles.values():
                if profile.optimization_suggestions:
                    opportunities.append({
                        'query_hash': profile.query_hash,
                        'sql_preview': profile.sql[:100] + '...',
                        'suggestions': profile.optimization_suggestions,
                        'potential_improvement': len(profile.optimization_suggestions) * 0.1
                    })
            
            # Sort by potential improvement
            opportunities.sort(key=lambda x: x['potential_improvement'], reverse=True)
            
        except Exception as e:
            logger.error(f"Failed to identify optimization opportunities: {e}")
        
        return opportunities[:10]  # Return top 10 opportunities
    
    def clear_profiles(self):
        """Clear all query profiles"""
        self.query_profiles.clear()
        logger.info("Query profiles cleared")
    
    def export_profiles(self, filepath: str):
        """Export query profiles to JSON file"""
        try:
            export_data = {
                'exported_at': datetime.utcnow().isoformat(),
                'profiles': [
                    {
                        'query_hash': p.query_hash,
                        'sql': p.sql,
                        'execution_time': p.execution_time,
                        'row_count': p.row_count,
                        'memory_usage': p.memory_usage,
                        'suggestions': p.optimization_suggestions,
                        'created_at': p.created_at.isoformat(),
                        'execution_count': p.execution_count
                    }
                    for p in self.query_profiles.values()
                ]
            }
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Query profiles exported to {filepath}")
            
        except Exception as e:
            logger.error(f"Failed to export profiles: {e}")


# Global optimizer instance
smart_query_optimizer = SmartQueryOptimizer()


# Convenience functions
def optimize_query(query: Query, expected_usage: str = 'read', context: str = None) -> OptimizationResult:
    """Optimize a query using the global optimizer"""
    return smart_query_optimizer.optimize_query(query, expected_usage, context)


def profile_query(query: Query, execution_time: float, row_count: int = 0, memory_usage: float = 0.0) -> str:
    """Profile a query execution"""
    return smart_query_optimizer.profile_query(query, execution_time, row_count, memory_usage)


def get_performance_report() -> Dict[str, Any]:
    """Get query performance report"""
    return smart_query_optimizer.get_performance_report()


def clear_query_profiles():
    """Clear all query profiles"""
    smart_query_optimizer.clear_profiles()


def export_query_profiles(filepath: str):
    """Export query profiles to file"""
    smart_query_optimizer.export_profiles(filepath)
