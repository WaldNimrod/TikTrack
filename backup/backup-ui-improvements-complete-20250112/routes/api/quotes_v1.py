"""
API Routes for Quotes - Compliant with External Data Integration Specification
Implements the exact API endpoints specified in Section 5.1 of the specification
"""

from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from config.database import get_db
from datetime import datetime, timezone
import logging
from typing import Dict, Any, Optional, List

from models.ticker import Ticker
from models.external_data import MarketDataQuote, ExternalDataProvider
from models.user import User
# UserPreferences model removed - using new dynamic preferences system
from services.user_service import UserService

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

quotes_bp = Blueprint('quotes', __name__, url_prefix='/api')

# Initialize base API (quotes is complex, so we'll use it selectively)

@quotes_bp.route('/quotes/batch', methods=['GET'])
def get_quotes_batch():
    """
    GET /api/quotes/batch?ticker_ids=... 
    
    As specified in Section 5.1 of External Data Integration Specification:
    - Preferred for UI
    - Responds with UTC timestamps (asof_utc, fetched_at)
    - No local fields in Stage-1
    """
    try:
        # Get parameters
        ticker_ids_param = request.args.get('ticker_ids', '')
        if not ticker_ids_param:
            return jsonify({
                "status": "error", 
                "error": "ticker_ids parameter is required",
                "message": "Usage: /api/quotes/batch?ticker_ids=1,2,3"
            }), 400
        
        # Parse ticker IDs
        try:
            ticker_ids = [int(tid.strip()) for tid in ticker_ids_param.split(',') if tid.strip()]
        except ValueError:
            return jsonify({
                "status": "error",
                "error": "Invalid ticker_ids format",
                "message": "ticker_ids must be comma-separated integers"
            }), 400
        
        if not ticker_ids:
            return jsonify({
                "status": "error",
                "error": "No valid ticker IDs provided"
            }), 400
        
        # Get database session
        db: Session = next(get_db())
        
        try:
            quotes = []
            
            for ticker_id in ticker_ids:
                try:
                    # Get ticker
                    ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
                    if not ticker:
                        continue  # Skip non-existent tickers silently
                    
                    # Get latest quote from quotes_last (as per specification)
                    quote = db.query(MarketDataQuote).filter(
                        MarketDataQuote.ticker_id == ticker_id
                    ).order_by(MarketDataQuote.fetched_at.desc()).first()
                    
                    if quote:
                        # Build response according to specification (UTC fields only)
                        quote_data = {
                            "ticker_id": ticker_id,
                            "symbol": ticker.symbol, 
                            "price": quote.price,
                            "change_pct_day": quote.change_pct_day,
                            "change_amount_day": quote.change_amount_day,
                            "volume": quote.volume,
                            "currency": quote.currency,
                            "asof_utc": quote.asof_utc.isoformat() if quote.asof_utc else None,
                            "fetched_at": quote.fetched_at.isoformat(),
                            "source": quote.source
                        }
                        quotes.append(quote_data)
                        
                except Exception as e:
                    logger.warning(f"Error processing ticker {ticker_id}: {e}")
                    continue
            
            return jsonify({
                "status": "success",
                "data": quotes,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 200
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error in batch quotes: {e}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


@quotes_bp.route('/quotes/<int:ticker_id>', methods=['GET'])  
def get_quote(ticker_id: int):
    """
    GET /api/quotes/{ticker_id}
    
    As specified in Section 5.1 of External Data Integration Specification:
    - Returns single quote for ticker
    - Responds with UTC timestamps (asof_utc, fetched_at)
    - No local fields in Stage-1
    """
    try:
        # Get database session
        db: Session = next(get_db())
        
        try:
            # Get ticker
            ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
            if not ticker:
                return jsonify({
                    "status": "error",
                    "error": f"Ticker with ID {ticker_id} not found"
                }), 404
            
            # Get latest quote
            quote = db.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == ticker_id
            ).order_by(MarketDataQuote.fetched_at.desc()).first()
            
            if not quote:
                return jsonify({
                    "status": "error", 
                    "error": f"No quote data available for ticker {ticker.symbol}"
                }), 404
            
            # Build response according to specification (UTC fields only)
            quote_data = {
                "ticker_id": ticker_id,
                "symbol": ticker.symbol,
                "price": quote.price,
                "change_pct_day": quote.change_pct_day,
                "change_amount_day": quote.change_amount_day,
                "volume": quote.volume,
                "currency": quote.currency,
                "asof_utc": quote.asof_utc.isoformat() if quote.asof_utc else None,
                "fetched_at": quote.fetched_at.isoformat(),
                "source": quote.source
            }
            
            return jsonify({
                "status": "success",
                "data": quote_data,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 200
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error getting quote for ticker {ticker_id}: {e}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


@quotes_bp.route('/user/preferences', methods=['GET'])
def get_user_preferences():
    """
    GET /api/user/preferences
    
    As specified in Section 5.2 of External Data Integration Specification:
    - Returns timezone and refresh_overrides_json
    - Uses fallback to default user (nimrod, ID: 1)
    """
    try:
        # Get user_id from query params or use default
        user_id = request.args.get('user_id', 1, type=int)
        
        # Get database session
        db: Session = next(get_db())
        
        try:
            # Get user preferences using UserService (with fallback)
            preferences = UserService.get_user_preferences(db, user_id)
            
            # Extract external data specific preferences according to specification
            external_data_prefs = {
                "timezone": preferences.get("timezone", "Asia/Jerusalem"),
                "refresh_overrides_json": preferences.get("refresh_overrides_json"),
                # Additional external data preferences
                "primaryDataProvider": preferences.get("primaryDataProvider", "yahoo"),
                "cacheTTL": preferences.get("cacheTTL", 5),
                "maxBatchSize": preferences.get("maxBatchSize", 25),
                "autoRefresh": preferences.get("autoRefresh", True)
            }
            
            return jsonify({
                "status": "success",
                "data": external_data_prefs,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 200
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error getting user preferences: {e}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


@quotes_bp.route('/user/preferences', methods=['PUT'])
def update_user_preferences():
    """
    PUT /api/user/preferences
    
    As specified in Section 5.2 of External Data Integration Specification:
    - Updates timezone and/or refresh_overrides_json
    - Server validates guardrails
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "status": "error",
                "error": "JSON data required"
            }), 400
        
        # Get user_id from data or use default
        user_id = data.get('user_id', 1)
        
        # Get database session  
        db: Session = next(get_db())
        
        try:
            # Validate timezone if provided
            if 'timezone' in data:
                timezone_str = data['timezone']
                valid_timezones = ['UTC', 'Asia/Jerusalem', 'America/New_York', 'Europe/London']
                if timezone_str not in valid_timezones:
                    return jsonify({
                        "status": "error",
                        "error": f"Invalid timezone. Allowed: {valid_timezones}"
                    }), 400
            
            # Validate refresh_overrides_json if provided
            if 'refresh_overrides_json' in data:
                refresh_overrides = data['refresh_overrides_json']
                if refresh_overrides:
                    # Validate structure and enforce guardrails
                    try:
                        import json
                        if isinstance(refresh_overrides, str):
                            refresh_data = json.loads(refresh_overrides)
                        else:
                            refresh_data = refresh_overrides
                        
                        # Enforce off_hours_min_interval >= 60m guardrail
                        if 'open' in refresh_data:
                            if 'active' in refresh_data['open'] and 'off_minutes' in refresh_data['open']['active']:
                                if refresh_data['open']['active']['off_minutes'] < 60:
                                    return jsonify({
                                        "status": "error", 
                                        "error": "off_hours_min_interval must be >= 60 minutes (guardrail enforced)"
                                    }), 400
                            
                            if 'no_active' in refresh_data['open'] and 'off_minutes' in refresh_data['open']['no_active']:
                                if refresh_data['open']['no_active']['off_minutes'] < 60:
                                    return jsonify({
                                        "status": "error",
                                        "error": "off_hours_min_interval must be >= 60 minutes (guardrail enforced)"
                                    }), 400
                        
                    except json.JSONDecodeError:
                        return jsonify({
                            "status": "error",
                            "error": "Invalid JSON format for refresh_overrides_json"
                        }), 400
            
            # Update preferences using UserService
            update_data = {}
            if 'timezone' in data:
                update_data['timezone'] = data['timezone']
            if 'refresh_overrides_json' in data:
                update_data['refresh_overrides_json'] = data['refresh_overrides_json']
            
            # Add other external data preferences
            external_data_fields = [
                'primaryDataProvider', 'cacheTTL', 'maxBatchSize', 'autoRefresh',
                'retryAttempts', 'retryDelay', 'verboseLogging'
            ]
            
            for field in external_data_fields:
                if field in data:
                    update_data[field] = data[field]
            
            # Update preferences
            success = UserService.update_user_preferences(db, user_id, update_data)
            
            if success:
                # Get updated preferences
                updated_preferences = UserService.get_user_preferences(db, user_id)
                
                return jsonify({
                    "status": "success",
                    "data": {
                        "timezone": updated_preferences.get("timezone"),
                        "refresh_overrides_json": updated_preferences.get("refresh_overrides_json"),
                        "message": "User preferences updated successfully"
                    },
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), 200
            else:
                return jsonify({
                    "status": "error",
                    "error": "Failed to update user preferences"
                }), 500
                
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error updating user preferences: {e}")
        return jsonify({
            "status": "error", 
            "error": str(e)
        }), 500