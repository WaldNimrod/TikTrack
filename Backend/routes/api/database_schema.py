"""
API Routes for Database Schema Information - TikTrack

This module contains all API endpoints for retrieving database schema information.
It provides direct access to the physical database structure, not the model structure.

Endpoints:
    GET /api/database-schema/tables - Get list of all tables
    GET /api/database-schema/table/<table_name> - Get schema for specific table
    GET /api/database-schema/table/<table_name>/data - Get data with physical column order

Author: TikTrack Development Team
Version: 1.0
Date: October 2025
"""

from flask import Blueprint, jsonify, request, g
from sqlalchemy import text
from sqlalchemy.orm import Session
from config.database import get_db
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

database_schema_bp = Blueprint('database_schema', __name__, url_prefix='/api/database-schema')

@database_schema_bp.route('/tables', methods=['GET'])
def get_all_tables():
    """Get list of all tables in the database"""
    try:
        db: Session = next(get_db())
        
        # Get all table names
        result = db.execute(
            text(
                "SELECT table_name "
                "FROM information_schema.tables "
                "WHERE table_schema = 'public' AND table_type = 'BASE TABLE' "
                "ORDER BY table_name"
            )
        )
        
        tables = [{'name': row[0]} for row in result]
        
        return jsonify({
            "status": "success",
            "data": tables,
            "message": "Tables retrieved successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting tables: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve tables"},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@database_schema_bp.route('/table/<table_name>', methods=['GET'])
def get_table_schema(table_name: str):
    """Get physical schema for a specific table"""
    try:
        db: Session = next(get_db())
        
        # Validate table name to prevent SQL injection
        valid_tables = [
            'trading_accounts', 'trades', 'tickers', 'trade_plans',
            'executions', 'alerts', 'notes', 'cash_flows',
            'currencies', 'users', 'external_data_providers',
            'market_data_quotes', 'intraday_data_slots',
            'entity_relation_types', 'preference_types',
            'preference_groups', 'preference_profiles', 'user_preferences'
        ]
        
        if table_name not in valid_tables:
            return jsonify({
                "status": "error",
                "error": {"message": f"Invalid table name: {table_name}"},
                "version": "1.0"
            }), 400
        
        pk_rows = db.execute(
            text(
                "SELECT kcu.column_name "
                "FROM information_schema.table_constraints tc "
                "JOIN information_schema.key_column_usage kcu "
                "ON tc.constraint_name = kcu.constraint_name "
                "AND tc.table_schema = kcu.table_schema "
                "WHERE tc.table_schema = 'public' "
                "AND tc.table_name = :table_name "
                "AND tc.constraint_type = 'PRIMARY KEY'"
            ),
            {"table_name": table_name},
        )
        pk_columns = {row[0] for row in pk_rows}

        result = db.execute(
            text(
                "SELECT column_name, data_type, is_nullable, column_default, ordinal_position "
                "FROM information_schema.columns "
                "WHERE table_schema = 'public' AND table_name = :table_name "
                "ORDER BY ordinal_position"
            ),
            {"table_name": table_name},
        )

        columns = []
        for row in result:
            columns.append({
                'cid': row[4],              # Column order in table
                'name': row[0],             # Column name
                'type': row[1],             # Data type
                'notnull': row[2] == "NO",  # NOT NULL constraint
                'dflt_value': row[3],       # Default value
                'pk': row[0] in pk_columns  # Primary key
            })
        
        # Sort columns by their physical order (cid)
        columns.sort(key=lambda x: x['cid'])
        
        return jsonify({
            "status": "success",
            "data": {
                "table_name": table_name,
                "columns": columns,
                "column_count": len(columns)
            },
            "message": "Table schema retrieved successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting schema for table {table_name}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to retrieve schema for {table_name}"},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@database_schema_bp.route('/table/<table_name>/data', methods=['GET'])
def get_table_data_with_schema(table_name: str):
    """Get data for a specific table with columns in physical order"""
    try:
        db: Session = next(get_db())
        
        # Validate table name to prevent SQL injection
        valid_tables = [
            'trading_accounts', 'trades', 'tickers', 'trade_plans',
            'executions', 'alerts', 'notes', 'cash_flows',
            'currencies', 'users', 'external_data_providers',
            'market_data_quotes', 'intraday_data_slots',
            'entity_relation_types', 'preference_types',
            'preference_groups', 'preference_profiles', 'user_preferences'
        ]
        
        if table_name not in valid_tables:
            return jsonify({
                "status": "error",
                "error": {"message": f"Invalid table name: {table_name}"},
                "version": "1.0"
            }), 400
        
        # Get the data first (SELECT * includes generated columns)
        data_result = db.execute(text(f"SELECT * FROM {table_name}"))
        
        # Get column names from the result (includes generated columns)
        column_names = list(data_result.keys()) if hasattr(data_result, 'keys') else []
        
        # Build data rows
        data = []
        for row in data_result:
            row_dict = {}
            for i, col_name in enumerate(column_names):
                value = row[i]
                # Format dates as strings if needed
                if value is not None and hasattr(value, 'isoformat'):
                    row_dict[col_name] = value.isoformat()
                else:
                    row_dict[col_name] = value
            data.append(row_dict)
        
        return jsonify({
            "status": "success",
            "data": {
                "table_name": table_name,
                "columns": column_names,
                "rows": data,
                "row_count": len(data)
            },
            "message": "Table data retrieved successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting data for table {table_name}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to retrieve data for {table_name}"},
            "version": "1.0"
        }), 500
    finally:
        db.close()
