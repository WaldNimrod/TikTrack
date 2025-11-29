"""
Base Entity API - TikTrack
==========================

Base class for all API modules providing common CRUD operations,
error handling, and standardized responses.

Features:
- Standardized CRUD operations
- Common error handling
- Response formatting
- Input validation
- Database session management

Author: TikTrack Development Team
Version: 1.0
Date: September 23, 2025
"""

from typing import Dict, List, Any, Optional, Tuple
from sqlalchemy.orm import Session
from flask import jsonify, request, g
import logging
from datetime import datetime

from services.date_normalization_service import DateNormalizationService
from services.preferences_service import PreferencesService


class BaseEntityAPI:
    """
    Base class for all API modules
    Provides standardized CRUD operations and common functionality
    """
    
    def __init__(self, entity_name: str, service_class, blueprint_name: str):
        """
        Initialize the base entity API
        
        Args:
            entity_name: Name of the entity (e.g., 'accounts', 'trades')
            service_class: Service class for business logic
            blueprint_name: Blueprint name for URL prefix
        """
        self.entity_name = entity_name
        self.service_class = service_class
        self.blueprint_name = blueprint_name
        self.logger = logging.getLogger(f"{__name__}.{entity_name}")
        self.preferences_service = PreferencesService()
    
    # ===== CRUD Operations =====
    
    def get_all(self, db: Session, filters: Dict = None) -> Tuple[Dict, int]:
        """
        Get all records with optional filters
        
        Args:
            db: Database session
            filters: Optional filters to apply
            
        Returns:
            Tuple of (response_dict, status_code)
        
        Note: Cache removed to ensure fresh data on every request
        See: Cache Architecture Simplification Plan
        """
        try:
            normalizer = self._get_date_normalizer()
            self.logger.info(f"Getting all {self.entity_name} records")
            
            # Get user_id from Flask context (set by auth middleware)
            user_id = getattr(g, 'user_id', None)
            
            # Get records from service directly (no cache for CRUD tables)
            # This ensures fresh data on every request
            if hasattr(self.service_class, 'get_all'):
                # Check if service.get_all accepts user_id parameter
                import inspect
                sig = inspect.signature(self.service_class.get_all)
                params = list(sig.parameters.keys())
                
                if 'user_id' in params:
                    # Service supports user_id filtering
                    if len(sig.parameters) > 2 and 'filters' in params:
                        records = self.service_class.get_all(db, filters, user_id=user_id)
                    elif len(sig.parameters) > 1:
                        records = self.service_class.get_all(db, user_id=user_id)
                    else:
                        records = self.service_class.get_all(db)
                elif len(sig.parameters) > 1 and 'filters' in params:
                    records = self.service_class.get_all(db, filters)
                else:
                    records = self.service_class.get_all(db)
                
                # If service returns enhanced data (dicts), use it directly
                if records and isinstance(records[0], dict):
                    data = records
                else:
                    # Convert to dict format
                    data = [record.to_dict() if hasattr(record, 'to_dict') else record for record in records]
            else:
                # Fallback to direct query if service doesn't have get_all
                records = db.query(self.service_class.model).all()
                data = [record.to_dict() if hasattr(record, 'to_dict') else record for record in records]
            
            data = normalizer.normalize_output(data)
            response = self._success_response(normalizer, data, f"Retrieved {len(data)} {self.entity_name} records")
            
            return response, 200
            
        except Exception as e:
            return self._handle_error(e, f"get_all_{self.entity_name}")
    
    def get_by_id(self, db: Session, entity_id: int) -> Tuple[Dict, int]:
        """
        Get record by ID
        
        Args:
            db: Database session
            entity_id: ID of the record to retrieve
            
        Returns:
            Tuple of (response_dict, status_code)
        """
        try:
            normalizer = self._get_date_normalizer()
            self.logger.info(f"Getting {self.entity_name} record with ID: {entity_id}")
            
            # Get user_id from Flask context (set by auth middleware)
            user_id = getattr(g, 'user_id', None)
            
            # Get record from service
            if hasattr(self.service_class, 'get_by_id'):
                # Check if service.get_by_id accepts user_id parameter
                import inspect
                sig = inspect.signature(self.service_class.get_by_id)
                if 'user_id' in sig.parameters:
                    record = self.service_class.get_by_id(db, entity_id, user_id=user_id)
                else:
                    record = self.service_class.get_by_id(db, entity_id)
            else:
                # Fallback to direct query (with user_id filter if model has user_id)
                query = db.query(self.service_class.model).filter(
                    self.service_class.model.id == entity_id
                )
                if user_id is not None and hasattr(self.service_class.model, 'user_id'):
                    query = query.filter(self.service_class.model.user_id == user_id)
                record = query.first()
            
            if not record:
                return self._error_response(f"{self.entity_name.title()} with ID {entity_id} not found", normalizer), 404
            
            # Convert to dict format
            data = record.to_dict() if hasattr(record, 'to_dict') else record
            data = normalizer.normalize_output(data)
            
            return self._success_response(normalizer, data, f"Retrieved {self.entity_name} record"), 200
            
        except Exception as e:
            return self._handle_error(e, f"get_by_id_{self.entity_name}")
    
    def create(self, db: Session, data: Dict) -> Tuple[Dict, int]:
        """
        Create new record
        
        Args:
            db: Database session
            data: Data for the new record
            
        Returns:
            Tuple of (response_dict, status_code)
        """
        try:
            normalizer = self._get_date_normalizer()
            self.logger.info(f"Creating new {self.entity_name} record")
            
            # Validate required fields
            required_fields = getattr(self.service_class, 'required_fields', [])
            if not self._validate_required_fields(data, required_fields):
                return self._error_response("Missing required fields", normalizer), 400
            
            # Get user_id from Flask context (set by auth middleware)
            user_id = getattr(g, 'user_id', None)
            
            # Sanitize input
            sanitized_data = self._sanitize_input(data)
            normalized_data = normalizer.normalize_input_payload(sanitized_data)
            
            # Create record via service
            if hasattr(self.service_class, 'create'):
                # Check if service.create accepts user_id parameter
                import inspect
                sig = inspect.signature(self.service_class.create)
                if 'user_id' in sig.parameters:
                    record = self.service_class.create(db, normalized_data, user_id=user_id)
                else:
                    # If service doesn't accept user_id, add it to data if model has user_id
                    if user_id is not None and hasattr(self.service_class.model, 'user_id') and 'user_id' not in normalized_data:
                        normalized_data['user_id'] = user_id
                    record = self.service_class.create(db, normalized_data)
            else:
                # Fallback to direct creation
                if user_id is not None and hasattr(self.service_class.model, 'user_id') and 'user_id' not in normalized_data:
                    normalized_data['user_id'] = user_id
                record = self.service_class.model(**normalized_data)
                db.add(record)
                db.commit()
                db.refresh(record)
            
            # Convert to dict format
            result_data = record.to_dict() if hasattr(record, 'to_dict') else record
            result_data = normalizer.normalize_output(result_data)
            
            return self._success_response(normalizer, result_data, f"Created {self.entity_name} record successfully"), 201
            
        except Exception as e:
            db.rollback()
            return self._handle_error(e, f"create_{self.entity_name}")
    
    def update(self, db: Session, entity_id: int, data: Dict) -> Tuple[Dict, int]:
        """
        Update existing record
        
        Args:
            db: Database session
            entity_id: ID of the record to update
            data: Updated data
            
        Returns:
            Tuple of (response_dict, status_code)
        """
        try:
            normalizer = self._get_date_normalizer()
            self.logger.info(f"Updating {self.entity_name} record with ID: {entity_id}")
            
            # Get user_id from Flask context (set by auth middleware)
            user_id = getattr(g, 'user_id', None)
            
            # Check if record exists (with user_id check)
            if hasattr(self.service_class, 'get_by_id'):
                import inspect
                sig = inspect.signature(self.service_class.get_by_id)
                if 'user_id' in sig.parameters:
                    existing_record = self.service_class.get_by_id(db, entity_id, user_id=user_id)
                else:
                    existing_record = self.service_class.get_by_id(db, entity_id)
            else:
                query = db.query(self.service_class.model).filter(
                    self.service_class.model.id == entity_id
                )
                if user_id is not None and hasattr(self.service_class.model, 'user_id'):
                    query = query.filter(self.service_class.model.user_id == user_id)
                existing_record = query.first()
            
            if not existing_record:
                return self._error_response(f"{self.entity_name.title()} with ID {entity_id} not found", normalizer), 404
            
            # Sanitize input
            sanitized_data = self._sanitize_input(data)
            normalized_data = normalizer.normalize_input_payload(sanitized_data)
            
            # Update record via service
            if hasattr(self.service_class, 'update'):
                import inspect
                sig = inspect.signature(self.service_class.update)
                if 'user_id' in sig.parameters:
                    record = self.service_class.update(db, entity_id, normalized_data, user_id=user_id)
                else:
                    record = self.service_class.update(db, entity_id, normalized_data)
            else:
                # Fallback to direct update
                for key, value in normalized_data.items():
                    if hasattr(existing_record, key):
                        setattr(existing_record, key, value)
                db.commit()
                db.refresh(existing_record)
                record = existing_record
            
            # Convert to dict format
            result_data = record.to_dict() if hasattr(record, 'to_dict') else record
            
            result_data = normalizer.normalize_output(result_data)
            
            return self._success_response(normalizer, result_data, f"Updated {self.entity_name} record successfully"), 200
            
        except Exception as e:
            db.rollback()
            return self._handle_error(e, f"update_{self.entity_name}")
    
    def delete(self, db: Session, entity_id: int) -> Tuple[Dict, int]:
        """
        Delete record by ID
        
        Args:
            db: Database session
            entity_id: ID of the record to delete
            
        Returns:
            Tuple of (response_dict, status_code)
        """
        try:
            normalizer = self._get_date_normalizer()
            self.logger.info(f"Deleting {self.entity_name} record with ID: {entity_id}")
            
            # Get user_id from Flask context (set by auth middleware)
            user_id = getattr(g, 'user_id', None)
            
            # Check if record exists (with user_id check)
            if hasattr(self.service_class, 'get_by_id'):
                import inspect
                sig = inspect.signature(self.service_class.get_by_id)
                if 'user_id' in sig.parameters:
                    existing_record = self.service_class.get_by_id(db, entity_id, user_id=user_id)
                else:
                    existing_record = self.service_class.get_by_id(db, entity_id)
            else:
                query = db.query(self.service_class.model).filter(
                    self.service_class.model.id == entity_id
                )
                if user_id is not None and hasattr(self.service_class.model, 'user_id'):
                    query = query.filter(self.service_class.model.user_id == user_id)
                existing_record = query.first()
            
            if not existing_record:
                return self._error_response(f"{self.entity_name.title()} with ID {entity_id} not found", normalizer), 404
            
            # Delete record via service
            if hasattr(self.service_class, 'delete'):
                import inspect
                sig = inspect.signature(self.service_class.delete)
                if 'user_id' in sig.parameters:
                    self.service_class.delete(db, entity_id, user_id=user_id)
                else:
                    self.service_class.delete(db, entity_id)
            else:
                # Fallback to direct deletion
                db.delete(existing_record)
                db.commit()
            
            response_payload = normalizer.normalize_output({"deleted_id": entity_id})
            return self._success_response(
                normalizer,
                response_payload, 
                f"Deleted {self.entity_name} record successfully"
            ), 200
            
        except Exception as e:
            db.rollback()
            return self._handle_error(e, f"delete_{self.entity_name}")
    
    # ===== Advanced Operations =====
    
    def search(self, db: Session, query: str, fields: List[str] = None) -> Tuple[Dict, int]:
        """
        Search records by query string
        
        Args:
            db: Database session
            query: Search query
            fields: Fields to search in (optional)
            
        Returns:
            Tuple of (response_dict, status_code)
        """
        try:
            normalizer = self._get_date_normalizer()
            self.logger.info(f"Searching {self.entity_name} records with query: {query}")
            
            # Use service search if available
            if hasattr(self.service_class, 'search'):
                records = self.service_class.search(db, query, fields)
            else:
                # Fallback to basic search
                records = []
                # This would need to be implemented based on specific entity needs
            
            # Convert to dict format
            if records:
                data = [record.to_dict() if hasattr(record, 'to_dict') else record for record in records]
            else:
                data = []
            data = normalizer.normalize_output(data)
            
            return self._success_response(normalizer, data, f"Found {len(data)} {self.entity_name} records"), 200
            
        except Exception as e:
            return self._handle_error(e, f"search_{self.entity_name}")
    
    def filter(self, db: Session, filters: Dict) -> Tuple[Dict, int]:
        """
        Filter records by criteria
        
        Args:
            db: Database session
            filters: Filter criteria
            
        Returns:
            Tuple of (response_dict, status_code)
        """
        try:
            normalizer = self._get_date_normalizer()
            self.logger.info(f"Filtering {self.entity_name} records with filters: {filters}")
            
            # Use service filter if available
            if hasattr(self.service_class, 'filter'):
                normalized_filters = normalizer.normalize_input_payload(filters)
                records = self.service_class.filter(db, normalized_filters)
            else:
                # Fallback to get_all with filters
                normalized_filters = normalizer.normalize_input_payload(filters)
                records = self.service_class.get_all(db, normalized_filters) if hasattr(self.service_class, 'get_all') else []
            
            # Convert to dict format
            if records:
                data = [record.to_dict() if hasattr(record, 'to_dict') else record for record in records]
            else:
                data = []
            
            data = normalizer.normalize_output(data)
            return self._success_response(normalizer, data, f"Filtered {len(data)} {self.entity_name} records"), 200
            
        except Exception as e:
            return self._handle_error(e, f"filter_{self.entity_name}")
    
    def list_with_pagination(self, db: Session, page: int = 1, per_page: int = 20) -> Tuple[Dict, int]:
        """
        Get paginated list of records
        
        Args:
            db: Database session
            page: Page number (1-based)
            per_page: Records per page
            
        Returns:
            Tuple of (response_dict, status_code)
        """
        try:
            normalizer = self._get_date_normalizer()
            self.logger.info(f"Getting paginated {self.entity_name} records - page {page}, per_page {per_page}")
            
            # Use service pagination if available
            if hasattr(self.service_class, 'get_paginated'):
                result = self.service_class.get_paginated(db, page, per_page)
            else:
                # Fallback to basic pagination
                offset = (page - 1) * per_page
                records = db.query(self.service_class.model).offset(offset).limit(per_page).all()
                total = db.query(self.service_class.model).count()
                
                result = {
                    'records': records,
                    'total': total,
                    'page': page,
                    'per_page': per_page,
                    'pages': (total + per_page - 1) // per_page
                }
            
            # Convert records to dict format
            if result.get('records'):
                data = [record.to_dict() if hasattr(record, 'to_dict') else record for record in result['records']]
            else:
                data = []
            
            response_data = {
                'data': normalizer.normalize_output(data),
                'pagination': {
                    'total': result.get('total', 0),
                    'page': result.get('page', page),
                    'per_page': result.get('per_page', per_page),
                    'pages': result.get('pages', 0)
                }
            }
            response_data = normalizer.normalize_output(response_data)
            
            return self._success_response(normalizer, response_data, f"Retrieved {len(data)} {self.entity_name} records"), 200
            
        except Exception as e:
            return self._handle_error(e, f"list_with_pagination_{self.entity_name}")
    
    # ===== Utility Methods =====
    
    def _get_date_normalizer(self) -> DateNormalizationService:
        try:
            timezone_name = DateNormalizationService.resolve_timezone(
                request,
                preferences_service=self.preferences_service
            )
        except Exception:
            timezone_name = "UTC"
        return DateNormalizationService(timezone_name)
    
    def _handle_error(self, error: Exception, operation: str) -> Tuple[Dict, int]:
        """
        Handle errors consistently
        
        Args:
            error: Exception that occurred
            operation: Operation that failed
            
        Returns:
            Tuple of (error_response_dict, status_code)
        """
        error_message = str(error)
        self.logger.error(f"Error in {operation}: {error_message}")
        
        # Determine status code based on error type
        if "not found" in error_message.lower():
            status_code = 404
        elif "validation" in error_message.lower() or "required" in error_message.lower():
            status_code = 400
        elif "permission" in error_message.lower() or "unauthorized" in error_message.lower():
            status_code = 403
        else:
            status_code = 500
        
        normalizer = None
        try:
            normalizer = self._get_date_normalizer()
        except Exception:
            normalizer = None
        
        return self._error_response(f"Failed to {operation}: {error_message}", normalizer), status_code
    
    def _success_response(self, normalizer: Optional[DateNormalizationService], data: Any, message: str) -> Dict:
        """
        Create standardized success response
        
        Args:
            data: Response data
            message: Success message
            
        Returns:
            Standardized response dictionary
        """
        timestamp_envelope = None
        if normalizer:
            timestamp_envelope = normalizer.now_envelope()
        else:
            timestamp_envelope = DateNormalizationService().now_envelope()
        return {
            "status": "success",
            "data": data,
            "message": message,
            "timestamp": timestamp_envelope,
            "version": "1.0"
        }
    
    def _error_response(self, message: str, normalizer: Optional[DateNormalizationService] = None) -> Dict:
        """
        Create standardized error response
        
        Args:
            message: Error message
            
        Returns:
            Standardized error response dictionary
        """
        if normalizer:
            timestamp_envelope = normalizer.now_envelope()
        else:
            timestamp_envelope = DateNormalizationService().now_envelope()
        return {
            "status": "error",
            "error": {"message": message},
            "timestamp": timestamp_envelope,
            "version": "1.0"
        }
    
    def _validate_required_fields(self, data: Dict, required_fields: List[str]) -> bool:
        """
        Validate that all required fields are present
        
        Args:
            data: Data to validate
            required_fields: List of required field names
            
        Returns:
            True if all required fields are present, False otherwise
        """
        if not required_fields:
            return True
        
        missing_fields = [field for field in required_fields if field not in data or data[field] is None]
        
        if missing_fields:
            self.logger.warning(f"Missing required fields: {missing_fields}")
            return False
        
        return True
    
    def _sanitize_input(self, data: Dict) -> Dict:
        """
        Sanitize input data
        
        Args:
            data: Input data to sanitize
            
        Returns:
            Sanitized data
        """
        sanitized = {}
        
        for key, value in data.items():
            # Remove None values
            if value is not None:
                # Basic string sanitization
                if isinstance(value, str):
                    sanitized[key] = value.strip()
                else:
                    sanitized[key] = value
        
        return sanitized
