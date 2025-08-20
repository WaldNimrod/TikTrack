"""
Templates for common function patterns with proper type annotations
Use these templates when creating new functions to ensure consistency
"""

from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from flask import jsonify, request

# ===== MODEL FUNCTION TEMPLATES =====

def model_to_dict_template(self) -> Dict[str, Any]:
    """Template for model to_dict() method"""
    result: Dict[str, Any] = {}
    for c in self.__table__.columns:
        value = getattr(self, c.name)
        if hasattr(value, 'strftime'):  # אם זה תאריך
            result[c.name] = value.strftime('%Y-%m-%d %H:%M:%S') if value else None
        else:
            result[c.name] = value
    return result

def model_repr_template(self) -> str:
    """Template for model __repr__() method"""
    return f"<{self.__class__.__name__}(id={self.id})>"

# ===== SERVICE FUNCTION TEMPLATES =====

def service_get_all_template(db: Session) -> List[Any]:
    """Template for service get_all method"""
    return db.query(ModelClass).all()

def service_get_by_id_template(db: Session, item_id: int) -> Optional[Any]:
    """Template for service get_by_id method"""
    return db.query(ModelClass).filter(ModelClass.id == item_id).first()

def service_create_template(db: Session, data: Dict[str, Any]) -> Any:
    """Template for service create method"""
    item = ModelClass(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

def service_update_template(db: Session, item_id: int, data: Dict[str, Any]) -> Optional[Any]:
    """Template for service update method"""
    item = db.query(ModelClass).filter(ModelClass.id == item_id).first()
    if item:
        for key, value in data.items():
            if hasattr(item, key):
                setattr(item, key, value)
        db.commit()
        db.refresh(item)
        return item
    return None

def service_delete_template(db: Session, item_id: int) -> bool:
    """Template for service delete method"""
    item = db.query(ModelClass).filter(ModelClass.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
        return True
    return False

# ===== API ROUTE TEMPLATES =====

def api_get_all_template() -> Any:
    """Template for API GET all endpoint"""
    try:
        db: Session = next(get_db())
        items = ServiceClass.get_all(db)
        return jsonify({
            "status": "success",
            "data": [item.to_dict() for item in items],
            "message": "Items retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting items: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve items"},
            "version": "v1"
        }), 500
    finally:
        db.close()

def api_get_by_id_template(item_id: int) -> Any:
    """Template for API GET by ID endpoint"""
    try:
        db: Session = next(get_db())
        item = ServiceClass.get_by_id(db, item_id)
        if item:
            return jsonify({
                "status": "success",
                "data": item.to_dict(),
                "message": "Item retrieved successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Item not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error getting item {item_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve item"},
            "version": "v1"
        }), 500
    finally:
        db.close()

def api_create_template() -> Any:
    """Template for API POST create endpoint"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        item = ServiceClass.create(db, data)
        return jsonify({
            "status": "success",
            "data": item.to_dict(),
            "message": "Item created successfully",
            "version": "v1"
        }), 201
    except Exception as e:
        logger.error(f"Error creating item: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

def api_update_template(item_id: int) -> Any:
    """Template for API PUT update endpoint"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        item = ServiceClass.update(db, item_id, data)
        if item:
            return jsonify({
                "status": "success",
                "data": item.to_dict(),
                "message": "Item updated successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Item not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error updating item {item_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

def api_delete_template(item_id: int) -> Any:
    """Template for API DELETE endpoint"""
    try:
        db: Session = next(get_db())
        success = ServiceClass.delete(db, item_id)
        if success:
            return jsonify({
                "status": "success",
                "message": "Item deleted successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Item not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error deleting item {item_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 500
    finally:
        db.close()

# ===== VALIDATION FUNCTION TEMPLATES =====

def validation_function_template(data: Dict[str, Any]) -> Tuple[bool, str]:
    """Template for validation functions"""
    errors: List[str] = []
    
    # Add validation logic here
    if not data.get('required_field'):
        errors.append("Required field is missing")
    
    if errors:
        return False, "; ".join(errors)
    
    return True, "Valid"

# ===== UTILITY FUNCTION TEMPLATES =====

def utility_function_template(param1: str, param2: Optional[int] = None) -> Dict[str, Any]:
    """Template for utility functions"""
    result: Dict[str, Any] = {
        'param1': param1,
        'param2': param2
    }
    return result
