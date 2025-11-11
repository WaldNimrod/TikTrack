#!/usr/bin/env python3
"""
Constraint Service - Dynamic Database Constraints Management
Date: August 23, 2025
Description: Service for managing database constraints dynamically
"""

import sqlite3
import os
import re
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import logging

from config.settings import DB_PATH

logger = logging.getLogger(__name__)

class ConstraintService:
    """
    Service for managing database constraints dynamically
    
    This service provides functionality to:
    - Get constraints for specific tables and columns
    - Validate field values against constraints
    - Get enum values for dropdowns
    - Add, update, and delete constraints
    - Manage constraint validations
    """
    
    def __init__(self, db_path: str = None):
        """Initialize the constraint service"""
        if db_path is None:
            # Default database path (production)
            db_path = str(DB_PATH)
        
        self.db_path = db_path
        logger.info(f"ConstraintService initialized with database: {db_path}")
    
    def get_db_connection(self) -> sqlite3.Connection:
        """Get database connection"""
        return sqlite3.connect(self.db_path)
    
    def get_constraints_for_table(self, table_name: str) -> List[Dict[str, Any]]:
        """
        Get all constraints for a specific table
        
        Args:
            table_name: Name of the table
            
        Returns:
            List of constraint dictionaries
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT id, table_name, column_name, constraint_type, constraint_name, 
                       constraint_definition, is_active, created_at, updated_at
                FROM constraints 
                WHERE table_name = ? AND is_active = 1
                ORDER BY column_name, constraint_type
            """, (table_name,))
            
            constraints = []
            for row in cursor.fetchall():
                constraint = {
                    'id': row[0],
                    'table_name': row[1],
                    'column_name': row[2],
                    'constraint_type': row[3],
                    'constraint_name': row[4],
                    'constraint_definition': row[5],
                    'is_active': bool(row[6]),
                    'created_at': row[7],
                    'updated_at': row[8]
                }
                
                # Add enum values if it's an ENUM constraint
                if row[3] == 'ENUM':
                    constraint['enum_values'] = self.get_enum_values_for_constraint(row[0])
                
                constraints.append(constraint)
            
            logger.info(f"Retrieved {len(constraints)} constraints for table {table_name}")
            return constraints
            
        except Exception as e:
            logger.error(f"Error getting constraints for table {table_name}: {e}")
            return []
        finally:
            conn.close()
    
    def get_constraints_for_column(self, table_name: str, column_name: str) -> List[Dict[str, Any]]:
        """
        Get all constraints for a specific column
        
        Args:
            table_name: Name of the table
            column_name: Name of the column
            
        Returns:
            List of constraint dictionaries
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT id, table_name, column_name, constraint_type, constraint_name, 
                       constraint_definition, is_active, created_at, updated_at
                FROM constraints 
                WHERE table_name = ? AND column_name = ? AND is_active = 1
                ORDER BY constraint_type
            """, (table_name, column_name))
            
            constraints = []
            for row in cursor.fetchall():
                constraint = {
                    'id': row[0],
                    'table_name': row[1],
                    'column_name': row[2],
                    'constraint_type': row[3],
                    'constraint_name': row[4],
                    'constraint_definition': row[5],
                    'is_active': bool(row[6]),
                    'created_at': row[7],
                    'updated_at': row[8]
                }
                
                # Add enum values if it's an ENUM constraint
                if row[3] == 'ENUM':
                    constraint['enum_values'] = self.get_enum_values_for_constraint(row[0])
                
                constraints.append(constraint)
            
            logger.info(f"Retrieved {len(constraints)} constraints for {table_name}.{column_name}")
            return constraints
            
        except Exception as e:
            logger.error(f"Error getting constraints for {table_name}.{column_name}: {e}")
            return []
        finally:
            conn.close()
    
    def validate_field_value(self, table_name: str, column_name: str, value: Any) -> Tuple[bool, str]:
        """
        Validate a field value against its constraints
        
        Args:
            table_name: Name of the table
            column_name: Name of the column
            value: Value to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        constraints = self.get_constraints_for_column(table_name, column_name)
        
        for constraint in constraints:
            is_valid, error_msg = self._validate_against_constraint(constraint, value)
            if not is_valid:
                return False, error_msg
        
        return True, "Value is valid"
    
    def _validate_against_constraint(self, constraint: Dict[str, Any], value: Any) -> Tuple[bool, str]:
        """
        Validate a value against a specific constraint
        
        Args:
            constraint: Constraint dictionary
            value: Value to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        constraint_type = constraint['constraint_type']
        
        try:
            if constraint_type == 'ENUM':
                return self._validate_enum_constraint(constraint, value)
            elif constraint_type == 'NOT_NULL':
                return self._validate_not_null_constraint(constraint, value)
            elif constraint_type == 'RANGE':
                return self._validate_range_constraint(constraint, value)
            elif constraint_type == 'UNIQUE':
                return self._validate_unique_constraint(constraint, value)
            else:
                logger.warning(f"Unknown constraint type: {constraint_type}")
                return True, "Unknown constraint type"
                
        except Exception as e:
            logger.error(f"Error validating constraint {constraint['constraint_name']}: {e}")
            return False, f"Validation error: {str(e)}"
    
    def _validate_enum_constraint(self, constraint: Dict[str, Any], value: Any) -> Tuple[bool, str]:
        """Validate ENUM constraint"""
        if value is None:
            return True, "Value is null (allowed)"
        
        enum_values = constraint.get('enum_values', [])
        allowed_values = [ev['value'] for ev in enum_values]
        
        if str(value) not in allowed_values:
            display_names = [ev['display_name'] for ev in enum_values]
            return False, f"Value '{value}' is not allowed. Allowed values: {', '.join(display_names)}"
        
        return True, "Value is valid"
    
    def _validate_not_null_constraint(self, constraint: Dict[str, Any], value: Any) -> Tuple[bool, str]:
        """Validate NOT NULL constraint"""
        if value is None or value == "":
            return False, f"Field {constraint['column_name']} is required"
        
        return True, "Value is not null"
    
    def _validate_range_constraint(self, constraint: Dict[str, Any], value: Any) -> Tuple[bool, str]:
        """Validate RANGE constraint"""
        if value is None:
            return True, "Value is null (allowed)"
        
        try:
            # Convert to float for numeric validation
            numeric_value = float(value)
            
            # Extract the condition from constraint_definition
            definition = constraint['constraint_definition']
            
            # Simple range validation - can be extended for more complex rules
            if '>' in definition:
                min_value = float(re.search(r'>\s*([0-9.]+)', definition).group(1))
                if numeric_value <= min_value:
                    return False, f"Value must be greater than {min_value}"
            
            elif '<' in definition:
                max_value = float(re.search(r'<\s*([0-9.]+)', definition).group(1))
                if numeric_value >= max_value:
                    return False, f"Value must be less than {max_value}"
            
            elif '>=' in definition:
                min_value = float(re.search(r'>=\s*([0-9.]+)', definition).group(1))
                if numeric_value < min_value:
                    return False, f"Value must be greater than or equal to {min_value}"
            
            elif '<=' in definition:
                max_value = float(re.search(r'<=\s*([0-9.]+)', definition).group(1))
                if numeric_value > max_value:
                    return False, f"Value must be less than or equal to {max_value}"
            
            return True, "Value is within range"
            
        except (ValueError, AttributeError):
            return False, f"Value '{value}' is not a valid number"
    
    def _validate_unique_constraint(self, constraint: Dict[str, Any], value: Any) -> Tuple[bool, str]:
        """Validate UNIQUE constraint"""
        # This would require checking the actual database
        # For now, we'll assume it's valid and let the database handle uniqueness
        return True, "Uniqueness will be checked by database"
    
    def get_enum_values(self, table_name: str, column_name: str) -> List[Dict[str, Any]]:
        """
        Get enum values for a specific column
        
        Args:
            table_name: Name of the table
            column_name: Name of the column
            
        Returns:
            List of enum value dictionaries
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT ev.id, ev.value, ev.display_name, ev.sort_order, ev.is_active
                FROM constraints c
                JOIN enum_values ev ON c.id = ev.constraint_id
                WHERE c.table_name = ? AND c.column_name = ? 
                AND c.constraint_type = 'ENUM' AND c.is_active = 1 AND ev.is_active = 1
                ORDER BY ev.sort_order
            """, (table_name, column_name))
            
            enum_values = []
            for row in cursor.fetchall():
                enum_values.append({
                    'id': row[0],
                    'value': row[1],
                    'display_name': row[2],
                    'sort_order': row[3],
                    'is_active': bool(row[4])
                })
            
            logger.info(f"Retrieved {len(enum_values)} enum values for {table_name}.{column_name}")
            return enum_values
            
        except Exception as e:
            logger.error(f"Error getting enum values for {table_name}.{column_name}: {e}")
            return []
        finally:
            conn.close()
    
    def get_enum_values_for_constraint(self, constraint_id: int) -> List[Dict[str, Any]]:
        """
        Get enum values for a specific constraint
        
        Args:
            constraint_id: ID of the constraint
            
        Returns:
            List of enum value dictionaries
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT id, value, display_name, sort_order, is_active
                FROM enum_values
                WHERE constraint_id = ? AND is_active = 1
                ORDER BY sort_order
            """, (constraint_id,))
            
            enum_values = []
            for row in cursor.fetchall():
                enum_values.append({
                    'id': row[0],
                    'value': row[1],
                    'display_name': row[2],
                    'sort_order': row[3],
                    'is_active': bool(row[4])
                })
            
            return enum_values
            
        except Exception as e:
            logger.error(f"Error getting enum values for constraint {constraint_id}: {e}")
            return []
        finally:
            conn.close()
    
    def add_constraint(self, constraint_data: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Add a new constraint
        
        Args:
            constraint_data: Dictionary containing constraint information
            
        Returns:
            Tuple of (success, message)
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Insert constraint
            cursor.execute("""
                INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
                VALUES (?, ?, ?, ?, ?)
            """, (
                constraint_data['table_name'],
                constraint_data['column_name'],
                constraint_data['constraint_type'],
                constraint_data['constraint_name'],
                constraint_data['constraint_definition']
            ))
            
            constraint_id = cursor.lastrowid
            
            # Add enum values if it's an ENUM constraint
            if constraint_data['constraint_type'] == 'ENUM' and 'enum_values' in constraint_data:
                for enum_value in constraint_data['enum_values']:
                    cursor.execute("""
                        INSERT INTO enum_values (constraint_id, value, display_name, sort_order)
                        VALUES (?, ?, ?, ?)
                    """, (
                        constraint_id,
                        enum_value['value'],
                        enum_value.get('display_name', enum_value['value']),
                        enum_value.get('sort_order', 0)
                    ))
            
            conn.commit()
            logger.info(f"Added constraint {constraint_data['constraint_name']} for {constraint_data['table_name']}.{constraint_data['column_name']}")
            return True, f"Constraint {constraint_data['constraint_name']} added successfully"
            
        except Exception as e:
            conn.rollback()
            logger.error(f"Error adding constraint: {e}")
            return False, f"Error adding constraint: {str(e)}"
        finally:
            conn.close()
    
    def update_constraint(self, constraint_id: int, constraint_data: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Update an existing constraint
        
        Args:
            constraint_id: ID of the constraint to update
            constraint_data: Dictionary containing updated constraint information
            
        Returns:
            Tuple of (success, message)
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Update constraint
            cursor.execute("""
                UPDATE constraints 
                SET table_name = ?, column_name = ?, constraint_type = ?, 
                    constraint_name = ?, constraint_definition = ?, 
                    is_active = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (
                constraint_data['table_name'],
                constraint_data['column_name'],
                constraint_data['constraint_type'],
                constraint_data['constraint_name'],
                constraint_data['constraint_definition'],
                constraint_data.get('is_active', True),
                constraint_id
            ))
            
            # Update enum values if it's an ENUM constraint
            if constraint_data['constraint_type'] == 'ENUM' and 'enum_values' in constraint_data:
                # Delete existing enum values
                cursor.execute("DELETE FROM enum_values WHERE constraint_id = ?", (constraint_id,))
                
                # Add new enum values
                for enum_value in constraint_data['enum_values']:
                    cursor.execute("""
                        INSERT INTO enum_values (constraint_id, value, display_name, sort_order)
                        VALUES (?, ?, ?, ?)
                    """, (
                        constraint_id,
                        enum_value['value'],
                        enum_value.get('display_name', enum_value['value']),
                        enum_value.get('sort_order', 0)
                    ))
            
            conn.commit()
            logger.info(f"Updated constraint {constraint_id}")
            return True, f"Constraint {constraint_id} updated successfully"
            
        except Exception as e:
            conn.rollback()
            logger.error(f"Error updating constraint {constraint_id}: {e}")
            return False, f"Error updating constraint: {str(e)}"
        finally:
            conn.close()
    
    def delete_constraint(self, constraint_id: int) -> Tuple[bool, str]:
        """
        Delete a constraint (soft delete by setting is_active = 0)
        
        Args:
            constraint_id: ID of the constraint to delete
            
        Returns:
            Tuple of (success, message)
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                UPDATE constraints 
                SET is_active = 0, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (constraint_id,))
            
            conn.commit()
            logger.info(f"Deleted constraint {constraint_id}")
            return True, f"Constraint {constraint_id} deleted successfully"
            
        except Exception as e:
            conn.rollback()
            logger.error(f"Error deleting constraint {constraint_id}: {e}")
            return False, f"Error deleting constraint: {str(e)}"
        finally:
            conn.close()
    
    def get_all_constraints(self) -> List[Dict[str, Any]]:
        """
        Get all active constraints
        
        Returns:
            List of all constraint dictionaries
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT id, table_name, column_name, constraint_type, constraint_name, 
                       constraint_definition, is_active, created_at, updated_at
                FROM constraints 
                WHERE is_active = 1
                ORDER BY table_name, column_name, constraint_type
            """)
            
            constraints = []
            for row in cursor.fetchall():
                constraint = {
                    'id': row[0],
                    'table_name': row[1],
                    'column_name': row[2],
                    'constraint_type': row[3],
                    'constraint_name': row[4],
                    'constraint_definition': row[5],
                    'is_active': bool(row[6]),
                    'created_at': row[7],
                    'updated_at': row[8]
                }
                
                # Add enum values if it's an ENUM constraint
                if row[3] == 'ENUM':
                    constraint['enum_values'] = self.get_enum_values_for_constraint(row[0])
                
                constraints.append(constraint)
            
            logger.info(f"Retrieved {len(constraints)} total constraints")
            return constraints
            
        except Exception as e:
            logger.error(f"Error getting all constraints: {e}")
            return []
        finally:
            conn.close()
    
    def get_tables_with_constraints(self) -> List[str]:
        """
        Get list of tables that have constraints defined
        
        Returns:
            List of table names
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT DISTINCT table_name 
                FROM constraints 
                WHERE is_active = 1
                ORDER BY table_name
            """)
            
            tables = [row[0] for row in cursor.fetchall()]
            logger.info(f"Found {len(tables)} tables with constraints: {tables}")
            return tables
            
        except Exception as e:
            logger.error(f"Error getting tables with constraints: {e}")
            return []
        finally:
            conn.close()
    
    def validate_active_trades_constraint(self) -> Tuple[bool, List[str]]:
        """
        Validate that all tickers active_trades field matches actual open trades/plans
        
        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            logger.info("Validating active_trades constraint...")
            
            # Get all tickers with their current active_trades value
            cursor.execute("""
                SELECT id, symbol, active_trades 
                FROM tickers
            """)
            
            tickers = cursor.fetchall()
            errors = []
            
            for ticker in tickers:
                ticker_id, symbol, current_active = ticker
                
                # Calculate what active_trades should be
                cursor.execute("""
                    SELECT 
                        (SELECT COUNT(*) > 0 FROM trades WHERE ticker_id = ? AND status = 'open') OR
                        (SELECT COUNT(*) > 0 FROM trade_plans WHERE ticker_id = ? AND status = 'open')
                """, (ticker_id, ticker_id))
                
                should_be_active = bool(cursor.fetchone()[0])
                
                if current_active != should_be_active:
                    error_msg = f"Ticker {symbol} (ID: {ticker_id}): active_trades={current_active}, should be={should_be_active}"
                    errors.append(error_msg)
                    logger.warning(error_msg)
            
            is_valid = len(errors) == 0
            logger.info(f"Active trades constraint validation: {len(errors)} errors found")
            
            return is_valid, errors
            
        except Exception as e:
            logger.error(f"Error validating active_trades constraint: {e}")
            return False, [f"Validation error: {str(e)}"]
        finally:
            conn.close()
    
    def fix_active_trades_constraint(self) -> Tuple[bool, int]:
        """
        Fix all tickers active_trades field to match actual open trades/plans
        
        Returns:
            Tuple of (success, number_of_fixed_tickers)
        """
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            logger.info("Fixing active_trades constraint...")
            
            # Update all tickers active_trades field
            cursor.execute("""
                UPDATE tickers 
                SET active_trades = (
                    SELECT COUNT(*) > 0 
                    FROM trades 
                    WHERE ticker_id = tickers.id AND status = 'open'
                ) OR (
                    SELECT COUNT(*) > 0 
                    FROM trade_plans 
                    WHERE ticker_id = tickers.id AND status = 'open'
                )
            """)
            
            fixed_count = cursor.rowcount
            conn.commit()
            
            logger.info(f"Fixed active_trades for {fixed_count} tickers")
            return True, fixed_count
            
        except Exception as e:
            logger.error(f"Error fixing active_trades constraint: {e}")
            conn.rollback()
            return False, 0
        finally:
            conn.close()
