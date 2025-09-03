"""
Database Schema Optimizer - TikTrack

This module provides database schema optimization functionality for the TikTrack system.
Includes schema analysis, optimization recommendations, and automated improvements.

Features:
- Schema analysis and validation
- Performance optimization recommendations
- Index optimization
- Constraint analysis
- Automated schema improvements

Author: TikTrack Development Team
Version: 1.0
Date: September 2025
"""

import time
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy import text, inspect
from sqlalchemy.orm import Session
from config.database import get_db, engine
from utils.performance_monitor import monitor_performance
import logging

logger = logging.getLogger(__name__)

class DatabaseOptimizer:
    """
    Database schema optimization service for TikTrack
    """
    
    def __init__(self):
        self.optimization_history: List[Dict[str, Any]] = []
        self.max_history_size = 100
    
    @monitor_performance("analyze_schema")
    def analyze_schema(self) -> Dict[str, Any]:
        """
        Analyze current database schema
        
        Returns:
            Dict[str, Any]: Schema analysis results
        """
        start_time = time.time()
        
        try:
            db: Session = next(get_db())
            
            # Get all tables
            result = db.execute(text("""
                SELECT 
                    name as table_name,
                    sql as table_sql,
                    type as object_type
                FROM sqlite_master 
                WHERE type='table'
                ORDER BY name
            """))
            tables = []
            for row in result:
                tables.append({
                    'table_name': row[0],
                    'table_sql': row[1],
                    'object_type': row[2]
                })
            
            # Get all indexes
            result = db.execute(text("""
                SELECT 
                    name as index_name,
                    tbl_name as table_name,
                    sql as index_sql,
                    CASE WHEN sql LIKE '%UNIQUE%' THEN 1 ELSE 0 END as is_unique
                FROM sqlite_master 
                WHERE type='index'
                ORDER BY tbl_name, name
            """))
            indexes = []
            for row in result:
                indexes.append({
                    'index_name': row[0],
                    'table_name': row[1],
                    'index_sql': row[2],
                    'is_unique': row[3]
                })
            
            # Get table statistics
            table_stats = {}
            for table in tables:
                table_name = table['table_name']
                if table_name != 'sqlite_sequence':
                    try:
                        # Record count
                        result = db.execute(text(f"SELECT COUNT(*) as count FROM {table_name}"))
                        record_count = result.fetchone()[0]
                        
                        # Table size
                        result = db.execute(text(f"""
                            SELECT 
                                SUM(length(hex(length(quote(t.*)))) + length(quote(t.*))) as size
                            FROM {table_name} t
                        """))
                        table_size = result.fetchone()[0] or 0
                        
                        # Indexes for this table
                        table_indexes = [idx for idx in indexes if idx['table_name'] == table_name]
                        
                        table_stats[table_name] = {
                            'record_count': record_count,
                            'size_bytes': table_size,
                            'index_count': len(table_indexes),
                            'indexes': table_indexes
                        }
                    except Exception as e:
                        table_stats[table_name] = {
                            'error': str(e),
                            'record_count': 0,
                            'size_bytes': 0,
                            'index_count': 0,
                            'indexes': []
                        }
            
            # Get foreign key constraints
            result = db.execute(text("PRAGMA foreign_key_list"))
            foreign_keys = []
            for row in result:
                foreign_keys.append({
                    'id': row[0],
                    'seq': row[1],
                    'table': row[2],
                    'from': row[3],
                    'to': row[4],
                    'on_update': row[5],
                    'on_delete': row[6],
                    'match': row[7]
                })
            
            # Get check constraints
            check_constraints = []
            for table in tables:
                table_name = table['table_name']
                if table_name != 'sqlite_sequence':
                    try:
                        result = db.execute(text(f"PRAGMA table_info({table_name})"))
                        columns = []
                        for row in result:
                            columns.append({
                                'cid': row[0],
                                'name': row[1],
                                'type': row[2],
                                'notnull': row[3],
                                'dflt_value': row[4],
                                'pk': row[5]
                            })
                        for column in columns:
                            if column.get('notnull') == 1:
                                check_constraints.append({
                                    'table': table_name,
                                    'column': column['name'],
                                    'constraint': 'NOT NULL'
                                })
                    except Exception:
                        pass
            
            db.close()
            
            analysis = {
                'timestamp': datetime.now().isoformat(),
                'schema': {
                    'total_tables': len(tables),
                    'total_indexes': len(indexes),
                    'total_foreign_keys': len(foreign_keys),
                    'total_constraints': len(check_constraints),
                    'tables': tables,
                    'indexes': indexes,
                    'foreign_keys': foreign_keys,
                    'constraints': check_constraints,
                    'table_stats': table_stats
                },
                'analysis_time_ms': round((time.time() - start_time) * 1000, 2)
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing schema: {e}")
            return {
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'analysis_time_ms': round((time.time() - start_time) * 1000, 2)
            }
    
    @monitor_performance("generate_optimization_recommendations")
    def generate_optimization_recommendations(self) -> Dict[str, Any]:
        """
        Generate optimization recommendations based on schema analysis
        
        Returns:
            Dict[str, Any]: Optimization recommendations
        """
        start_time = time.time()
        
        try:
            schema_analysis = self.analyze_schema()
            
            if 'error' in schema_analysis:
                return {
                    'timestamp': datetime.now().isoformat(),
                    'error': schema_analysis['error'],
                    'recommendations': []
                }
            
            recommendations = []
            
            # Analyze tables without indexes
            for table_name, stats in schema_analysis['schema']['table_stats'].items():
                if stats['index_count'] == 0 and stats['record_count'] > 10:
                    recommendations.append({
                        'type': 'missing_index',
                        'priority': 'high',
                        'table': table_name,
                        'description': f'Table {table_name} has {stats["record_count"]} records but no indexes',
                        'suggestion': f'Consider adding indexes for frequently queried columns in {table_name}'
                    })
            
            # Analyze large tables
            for table_name, stats in schema_analysis['schema']['table_stats'].items():
                if stats['record_count'] > 1000:
                    recommendations.append({
                        'type': 'large_table',
                        'priority': 'medium',
                        'table': table_name,
                        'description': f'Table {table_name} has {stats["record_count"]} records',
                        'suggestion': f'Consider partitioning or archiving old data from {table_name}'
                    })
            
            # Analyze foreign key constraints
            fk_tables = set()
            for fk in schema_analysis['schema']['foreign_keys']:
                fk_tables.add(fk['table'])
            
            for table_name in schema_analysis['schema']['table_stats'].keys():
                if table_name not in fk_tables and table_name not in ['sqlite_sequence']:
                    recommendations.append({
                        'type': 'missing_foreign_key',
                        'priority': 'low',
                        'table': table_name,
                        'description': f'Table {table_name} has no foreign key constraints',
                        'suggestion': f'Consider adding foreign key constraints to {table_name} for data integrity'
                    })
            
            # Analyze index efficiency
            for index in schema_analysis['schema']['indexes']:
                if not index['is_unique']:
                    table_name = index['table_name']
                    if table_name in schema_analysis['schema']['table_stats']:
                        stats = schema_analysis['schema']['table_stats'][table_name]
                        if stats['record_count'] < 100:
                            recommendations.append({
                                'type': 'unnecessary_index',
                                'priority': 'low',
                                'table': table_name,
                                'index': index['index_name'],
                                'description': f'Index {index["index_name"]} on {table_name} may be unnecessary',
                                'suggestion': f'Consider removing index {index["index_name"]} if not frequently used'
                            })
            
            # Performance recommendations
            total_records = sum(stats['record_count'] for stats in schema_analysis['schema']['table_stats'].values())
            if total_records > 10000:
                recommendations.append({
                    'type': 'performance',
                    'priority': 'high',
                    'description': f'Database has {total_records} total records',
                    'suggestion': 'Consider implementing database maintenance procedures and regular cleanup'
                })
            
            # Categorize recommendations
            high_priority = [r for r in recommendations if r['priority'] == 'high']
            medium_priority = [r for r in recommendations if r['priority'] == 'medium']
            low_priority = [r for r in recommendations if r['priority'] == 'low']
            
            result = {
                'timestamp': datetime.now().isoformat(),
                'recommendations': {
                    'high_priority': high_priority,
                    'medium_priority': medium_priority,
                    'low_priority': low_priority,
                    'total': len(recommendations)
                },
                'summary': {
                    'total_recommendations': len(recommendations),
                    'high_priority_count': len(high_priority),
                    'medium_priority_count': len(medium_priority),
                    'low_priority_count': len(low_priority)
                },
                'analysis_time_ms': round((time.time() - start_time) * 1000, 2)
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return {
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'recommendations': [],
                'analysis_time_ms': round((time.time() - start_time) * 1000, 2)
            }
    
    @monitor_performance("optimize_indexes")
    def optimize_indexes(self) -> Dict[str, Any]:
        """
        Optimize database indexes
        
        Returns:
            Dict[str, Any]: Index optimization results
        """
        start_time = time.time()
        
        try:
            db: Session = next(get_db())
            
            # Analyze current indexes
            result = db.execute(text("""
                SELECT 
                    name as index_name,
                    tbl_name as table_name,
                    sql as index_sql
                FROM sqlite_master 
                WHERE type='index'
                ORDER BY tbl_name, name
            """))
            current_indexes = [dict(row) for row in result]
            
            # Get table statistics
            table_stats = {}
            for index in current_indexes:
                table_name = index['table_name']
                if table_name not in table_stats:
                    try:
                        result = db.execute(text(f"SELECT COUNT(*) as count FROM {table_name}"))
                        record_count = result.fetchone()[0]
                        table_stats[table_name] = record_count
                    except Exception:
                        table_stats[table_name] = 0
            
            # Analyze index usage (simplified)
            index_analysis = []
            for index in current_indexes:
                table_name = index['table_name']
                record_count = table_stats.get(table_name, 0)
                
                # Simple heuristic for index efficiency
                efficiency = 'good'
                if record_count < 50:
                    efficiency = 'questionable'
                elif record_count < 10:
                    efficiency = 'poor'
                
                index_analysis.append({
                    'index_name': index['index_name'],
                    'table_name': table_name,
                    'record_count': record_count,
                    'efficiency': efficiency,
                    'recommendation': 'keep' if efficiency == 'good' else 'review'
                })
            
            db.close()
            
            result = {
                'timestamp': datetime.now().isoformat(),
                'index_optimization': {
                    'total_indexes': len(current_indexes),
                    'index_analysis': index_analysis,
                    'efficiency_summary': {
                        'good': len([i for i in index_analysis if i['efficiency'] == 'good']),
                        'questionable': len([i for i in index_analysis if i['efficiency'] == 'questionable']),
                        'poor': len([i for i in index_analysis if i['efficiency'] == 'poor'])
                    }
                },
                'optimization_time_ms': round((time.time() - start_time) * 1000, 2)
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error optimizing indexes: {e}")
            return {
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'optimization_time_ms': round((time.time() - start_time) * 1000, 2)
            }
    
    @monitor_performance("validate_constraints")
    def validate_constraints(self) -> Dict[str, Any]:
        """
        Validate database constraints
        
        Returns:
            Dict[str, Any]: Constraint validation results
        """
        start_time = time.time()
        
        try:
            db: Session = next(get_db())
            
            # Check foreign key constraints
            result = db.execute(text("PRAGMA foreign_key_check"))
            fk_violations = []
            for row in result:
                fk_violations.append({
                    'table': row[0],
                    'rowid': row[1],
                    'parent': row[2],
                    'fkid': row[3]
                })
            
            # Check NOT NULL constraints
            not_null_violations = []
            
            # Get all tables
            result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
            tables = [row[0] for row in result]
            
            for table_name in tables:
                if table_name != 'sqlite_sequence':
                    try:
                        # Get table info
                        result = db.execute(text(f"PRAGMA table_info({table_name})"))
                        columns = []
                        for row in result:
                            columns.append({
                                'cid': row[0],
                                'name': row[1],
                                'type': row[2],
                                'notnull': row[3],
                                'dflt_value': row[4],
                                'pk': row[5]
                            })
                        
                        for column in columns:
                            if column.get('notnull') == 1:
                                # Check for NULL values
                                result = db.execute(text(f"SELECT COUNT(*) FROM {table_name} WHERE {column['name']} IS NULL"))
                                null_count = result.fetchone()[0]
                                
                                if null_count > 0:
                                    not_null_violations.append({
                                        'table': table_name,
                                        'column': column['name'],
                                        'null_count': null_count
                                    })
                    except Exception:
                        pass
            
            db.close()
            
            result = {
                'timestamp': datetime.now().isoformat(),
                'constraint_validation': {
                    'foreign_key_violations': len(fk_violations),
                    'not_null_violations': len(not_null_violations),
                    'total_violations': len(fk_violations) + len(not_null_violations),
                    'fk_violations': fk_violations,
                    'not_null_violations': not_null_violations
                },
                'validation_time_ms': round((time.time() - start_time) * 1000, 2)
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error validating constraints: {e}")
            return {
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'validation_time_ms': round((time.time() - start_time) * 1000, 2)
            }
    
    def generate_optimization_report(self) -> Dict[str, Any]:
        """
        Generate comprehensive database optimization report
        
        Returns:
            Dict[str, Any]: Comprehensive optimization report
        """
        start_time = time.time()
        
        # Collect all optimization data
        schema_analysis = self.analyze_schema()
        recommendations = self.generate_optimization_recommendations()
        index_optimization = self.optimize_indexes()
        constraint_validation = self.validate_constraints()
        
        # Generate summary
        total_recommendations = recommendations.get('summary', {}).get('total_recommendations', 0)
        total_violations = constraint_validation.get('constraint_validation', {}).get('total_violations', 0)
        
        # Determine overall health
        if total_violations > 0:
            health_status = 'warning'
        elif total_recommendations > 5:
            health_status = 'needs_attention'
        else:
            health_status = 'healthy'
        
        report = {
            'generated_at': datetime.now().isoformat(),
            'overall_health': health_status,
            'schema_analysis': schema_analysis,
            'recommendations': recommendations,
            'index_optimization': index_optimization,
            'constraint_validation': constraint_validation,
            'summary': {
                'total_tables': schema_analysis.get('schema', {}).get('total_tables', 0),
                'total_indexes': schema_analysis.get('schema', {}).get('total_indexes', 0),
                'total_recommendations': total_recommendations,
                'total_violations': total_violations,
                'health_status': health_status
            },
            'report_generation_time_ms': round((time.time() - start_time) * 1000, 2)
        }
        
        # Store in history
        self.optimization_history.append(report)
        if len(self.optimization_history) > self.max_history_size:
            self.optimization_history.pop(0)
        
        return report

# Global database optimizer instance
database_optimizer = DatabaseOptimizer()
