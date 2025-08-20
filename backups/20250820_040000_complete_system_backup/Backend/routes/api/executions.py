from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from models.execution import Execution
import logging

logger = logging.getLogger(__name__)

executions_bp = Blueprint('executions', __name__, url_prefix='/api/v1/executions')

@executions_bp.route('/', methods=['GET'])
def get_executions():
    """קבלת כל הביצועים"""
    try:
        db: Session = next(get_db())
        executions = db.query(Execution).all()
        return jsonify({
            "status": "success",
            "data": [execution.to_dict() for execution in executions],
            "message": "Executions retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting executions: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve executions"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@executions_bp.route('/<int:execution_id>', methods=['GET'])
def get_execution(execution_id: int):
    """קבלת ביצוע לפי מזהה"""
    try:
        db: Session = next(get_db())
        execution = db.query(Execution).filter(Execution.id == execution_id).first()
        if execution:
            return jsonify({
                "status": "success",
                "data": execution.to_dict(),
                "message": "Execution retrieved successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Execution not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error getting execution {execution_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve execution"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@executions_bp.route('/', methods=['POST'])
def create_execution():
    """יצירת ביצוע חדש"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        execution = Execution(**data)
        db.add(execution)
        db.commit()
        db.refresh(execution)
        return jsonify({
            "status": "success",
            "data": execution.to_dict(),
            "message": "Execution created successfully",
            "version": "v1"
        }), 201
    except Exception as e:
        logger.error(f"Error creating execution: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@executions_bp.route('/<int:execution_id>', methods=['PUT'])
def update_execution(execution_id: int):
    """עדכון ביצוע"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        execution = db.query(Execution).filter(Execution.id == execution_id).first()
        if execution:
            for key, value in data.items():
                if hasattr(execution, key):
                    setattr(execution, key, value)
            db.commit()
            db.refresh(execution)
            return jsonify({
                "status": "success",
                "data": execution.to_dict(),
                "message": "Execution updated successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Execution not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error updating execution {execution_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@executions_bp.route('/<int:execution_id>', methods=['DELETE'])
def delete_execution(execution_id: int):
    """מחיקת ביצוע"""
    try:
        db: Session = next(get_db())
        execution = db.query(Execution).filter(Execution.id == execution_id).first()
        if execution:
            db.delete(execution)
            db.commit()
            return jsonify({
                "status": "success",
                "message": "Execution deleted successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Execution not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error deleting execution {execution_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 500
    finally:
        db.close()
