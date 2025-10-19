"""
Validation Service - Dynamic Constraint Validation
=================================================

This service validates data against the dynamic constraints defined in the database.
It checks all constraint types: NOT NULL, CHECK, UNIQUE, FOREIGN KEY, ENUM, RANGE.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-08-23
"""

from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any, List, Tuple, Optional
import logging
import re

logger = logging.getLogger(__name__)

class ValidationService:
    """Service for validating data against dynamic constraints"""
    
    @staticmethod
    def validate_data(db: Session, table_name: str, data: Dict[str, Any], exclude_id: Optional[int] = None) -> Tuple[bool, List[str]]:
        """
        Validate data against all constraints for a specific table
        
        Args:
            db: Database session
            table_name: Name of the table to validate against
            data: Data to validate
            exclude_id: ID to exclude from unique checks (for updates)
            
        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        logger.info(f"Starting validation for {table_name} with data: {data}, exclude_id: {exclude_id}")
        errors = []
        
        try:
            # Get all constraints for this table
            constraints_query = text("""
                SELECT c.id, c.constraint_type, c.column_name, c.constraint_definition, 
                       c.is_active
                FROM constraints c 
                WHERE c.table_name = :table_name AND c.is_active = 1
            """)
            
            constraints = db.execute(constraints_query, {"table_name": table_name}).fetchall()
            logger.info(f"Validating {table_name} - found {len(constraints)} constraints")
        except Exception as e:
            logger.warning(f"Could not fetch constraints for {table_name}: {str(e)}")
            constraints = []
            
            logger.info(f"Starting constraint loop for {table_name}")
            for constraint in constraints:
                constraint_id, constraint_type, field_name, definition, is_active = constraint
                
                # Skip inactive constraints
                if not is_active:
                    continue
                
                field_value = data.get(field_name)
                logger.info(f"Validating constraint: {constraint_type} on {field_name}={field_value}, definition={definition}")
                logger.info(f"Constraint type comparison: '{constraint_type}' == 'FOREIGN KEY' = {constraint_type == 'FOREIGN KEY'}")
                
                # Validate based on constraint type
                if constraint_type == 'NOT NULL':
                    if not ValidationService._validate_not_null(field_value):
                        errors.append(f"Field '{field_name}' is required")
                
                elif constraint_type == 'CHECK':
                    if field_value is not None and not ValidationService._validate_check(field_value, definition):
                        errors.append(f"Field '{field_name}' violates constraint: {definition}")
                
                elif constraint_type == 'UNIQUE':
                    if field_value is not None and not ValidationService._validate_unique(db, table_name, field_name, field_value, exclude_id):
                        errors.append(f"Field '{field_name}' must be unique")
                
                elif constraint_type == 'ENUM':
                    if field_value is not None and not ValidationService._validate_enum(db, constraint_id, field_value):
                        errors.append(f"Field '{field_name}' has invalid value")
                
                elif constraint_type == 'FOREIGN KEY':
                    logger.info(f"FOREIGN KEY constraint found for {field_name}")
                    if field_value is not None:
                        logger.info(f"Validating FK: {field_name}={field_value}, definition={definition}")
                        logger.info(f"About to call _validate_foreign_key")
                        result = ValidationService._validate_foreign_key(db, definition, field_value)
                        logger.info(f"_validate_foreign_key returned: {result}")
                        if not result:
                            errors.append(f"Field '{field_name}' references non-existent record")
                            logger.info(f"FK validation failed for {field_name}={field_value}")
                    else:
                        logger.info(f"FOREIGN KEY field {field_name} is None, skipping validation")
                
                elif constraint_type == 'RANGE':
                    if field_value is not None and not ValidationService._validate_range(field_value, definition):
                        errors.append(f"Field '{field_name}' is out of range")
        
        except Exception as e:
            logger.error(f"Error validating data for table {table_name}: {str(e)}")
            errors.append(f"Validation error: {str(e)}")
        
        logger.info(f"Validation completed for {table_name}: {len(errors)} errors found")
        return len(errors) == 0, errors
    
    @staticmethod
    def _validate_not_null(value: Any) -> bool:
        """Validate NOT NULL constraint"""
        if value is None:
            return False
        if isinstance(value, str) and value.strip() == "":
            return False
        return True
    
    @staticmethod
    def _validate_check(value: Any, definition: str) -> bool:
        """Validate CHECK constraint"""
        try:
            # Handle common CHECK constraint patterns
            
            # Length constraints: LENGTH(field) >= X
            length_match = re.search(r'LENGTH\(\w+\)\s*>=\s*(\d+)', definition, re.IGNORECASE)
            if length_match:
                min_length = int(length_match.group(1))
                if isinstance(value, str):
                    return len(value) >= min_length
            
            # Length constraints: LENGTH(field) <= X  
            length_match = re.search(r'LENGTH\(\w+\)\s*<=\s*(\d+)', definition, re.IGNORECASE)
            if length_match:
                max_length = int(length_match.group(1))
                if isinstance(value, str):
                    return len(value) <= max_length
            
            # Numeric constraints: field > X
            numeric_match = re.search(r'\w+\s*>\s*(\d+(?:\.\d+)?)', definition, re.IGNORECASE)
            if numeric_match:
                min_value = float(numeric_match.group(1))
                if isinstance(value, (int, float)):
                    return value > min_value
            
            # Numeric constraints: field >= X
            numeric_match = re.search(r'\w+\s*>=\s*(\d+(?:\.\d+)?)', definition, re.IGNORECASE)
            if numeric_match:
                min_value = float(numeric_match.group(1))
                if isinstance(value, (int, float)):
                    return value >= min_value
            
            # Date constraints: field IS NOT NULL OR field <= CURRENT_TIMESTAMP
            if 'CURRENT_TIMESTAMP' in definition.upper() and 'IS NOT NULL' in definition.upper():
                # For now, assume date validation passes - can be enhanced
                return True
            
            # Default: assume constraint passes if we can't parse it
            logger.warning(f"Unable to parse CHECK constraint: {definition}")
            return True
            
        except Exception as e:
            logger.error(f"Error validating CHECK constraint '{definition}': {str(e)}")
            return False
    
    @staticmethod
    def _validate_unique(db: Session, table_name: str, field_name: str, value: Any, exclude_id: Optional[int] = None) -> bool:
        """Validate UNIQUE constraint"""
        try:
            logger.info(f"Validating UNIQUE constraint: {table_name}.{field_name} = {value}, exclude_id = {exclude_id}")
            query = text(f"SELECT COUNT(*) FROM {table_name} WHERE {field_name} = :value")
            params = {"value": value}
            
            if exclude_id is not None:
                query = text(f"SELECT COUNT(*) FROM {table_name} WHERE {field_name} = :value AND id != :exclude_id")
                params["exclude_id"] = exclude_id
                logger.info(f"Using exclude_id query: {query}")
            
            count = db.execute(query, params).scalar()
            logger.info(f"UNIQUE validation result: {count} records found")
            return count == 0
            
        except Exception as e:
            logger.error(f"Error validating UNIQUE constraint for {table_name}.{field_name}: {str(e)}")
            return False
    
    @staticmethod
    def _validate_enum(db: Session, constraint_id: int, value: Any) -> bool:
        """Validate ENUM constraint"""
        try:
            enum_query = text("SELECT value FROM enum_values WHERE constraint_id = :constraint_id")
            enum_values = db.execute(enum_query, {"constraint_id": constraint_id}).fetchall()
            valid_values = [row[0] for row in enum_values]
            return str(value) in valid_values
            
        except Exception as e:
            logger.error(f"Error validating ENUM constraint {constraint_id}: {str(e)}")
            return False
    
    @staticmethod
    def _validate_foreign_key(db: Session, definition: str, value: Any) -> bool:
        """Validate FOREIGN KEY constraint"""
        try:
            # Parse FOREIGN KEY definition: "FOREIGN KEY (column) REFERENCES table(column)"
            fk_match = re.search(r'FOREIGN\s+KEY\s*\(\s*\w+\s*\)\s+REFERENCES\s+(\w+)\s*\(\s*(\w+)\s*\)', definition, re.IGNORECASE)
            if not fk_match:
                # Try alternative format: "REFERENCES table(column)"
                fk_match = re.search(r'REFERENCES\s+(\w+)\s*\(\s*(\w+)\s*\)', definition, re.IGNORECASE)
                if not fk_match:
                    logger.warning(f"Unable to parse FOREIGN KEY constraint: {definition}")
                    return True
            
            ref_table = fk_match.group(1)
            ref_column = fk_match.group(2)
            
            logger.info(f"Checking FK: {ref_table}.{ref_column} = {value}")
            query = text(f"SELECT COUNT(*) FROM {ref_table} WHERE {ref_column} = :value")
            count = db.execute(query, {"value": value}).scalar()
            logger.info(f"FK check result: {count} records found")
            return count > 0
            
        except Exception as e:
            logger.error(f"Error validating FOREIGN KEY constraint '{definition}': {str(e)}")
            return False
    
    @staticmethod
    def _validate_range(value: Any, definition: str) -> bool:
        """Validate RANGE constraint"""
        try:
            # Handle range constraints like "BETWEEN 0 AND 100"
            range_match = re.search(r'BETWEEN\s+(\d+(?:\.\d+)?)\s+AND\s+(\d+(?:\.\d+)?)', definition, re.IGNORECASE)
            if range_match:
                min_val = float(range_match.group(1))
                max_val = float(range_match.group(2))
                if isinstance(value, (int, float)):
                    return min_val <= value <= max_val
            
            # Handle inequality constraints like "field != 0"
            not_equal_match = re.search(r'\w+\s*!=\s*(\d+(?:\.\d+)?)', definition, re.IGNORECASE)
            if not_equal_match:
                not_equal_val = float(not_equal_match.group(1))
                if isinstance(value, (int, float)):
                    return value != not_equal_val
            
            # Handle greater than constraints like "field > 0"
            greater_than_match = re.search(r'\w+\s*>\s*(\d+(?:\.\d+)?)', definition, re.IGNORECASE)
            if greater_than_match:
                min_val = float(greater_than_match.group(1))
                if isinstance(value, (int, float)):
                    return value > min_val
            
            # Handle greater than or equal constraints like "field >= 0"
            greater_equal_match = re.search(r'\w+\s*>=\s*(\d+(?:\.\d+)?)', definition, re.IGNORECASE)
            if greater_equal_match:
                min_val = float(greater_equal_match.group(1))
                if isinstance(value, (int, float)):
                    return value >= min_val
            
            # Handle less than constraints like "field < 100"
            less_than_match = re.search(r'\w+\s*<\s*(\d+(?:\.\d+)?)', definition, re.IGNORECASE)
            if less_than_match:
                max_val = float(less_than_match.group(1))
                if isinstance(value, (int, float)):
                    return value < max_val
            
            # Handle less than or equal constraints like "field <= 100"
            less_equal_match = re.search(r'\w+\s*<=\s*(\d+(?:\.\d+)?)', definition, re.IGNORECASE)
            if less_equal_match:
                max_val = float(less_equal_match.group(1))
                if isinstance(value, (int, float)):
                    return value <= max_val
            
            # Default: assume constraint passes if we can't parse it
            logger.warning(f"Unable to parse RANGE constraint: {definition}")
            return True
            
        except Exception as e:
            logger.error(f"Error validating RANGE constraint '{definition}': {str(e)}")
            return False