#!/usr/bin/env python3
"""
TikTrack New Architecture Server
שרת TikTrack עם ארכיטקטורה חדשה

⚠️  אזהרה: שרת זה עדיין בפיתוח ולא יציב!
    - עלול ליפול עם segmentation fault
    - לא מומלץ לשימוש בייצור
    - השתמשו בשרת הישן (app.py) לייצור

📋 תכונות חדשות:
    - מערכת אימות JWT + RBAC
    - תיעוד API עם Swagger
    - ארכיטקטורה מודולרית עם Blueprints
    - בדיקות אוטומטיות
    - תמיכה ב-Docker

🔧 הפעלה:
    python3 app_new.py

📚 תיעוד:
    http://localhost:8080/api/docs

📝 לוגים:
    server_detailed.log

📖 מדריך מפורט:
    README_SERVER_SETUP.md
"""

from flask import Flask, send_from_directory, g, request, jsonify
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
from config.settings import UI_DIR, HOST, PORT, DEBUG
from config.database import init_db
from config.logging import setup_logging
from routes import (
    tickers_bp, accounts_bp, trades_bp, trade_plans_bp, 
    auth_bp, alerts_bp, cash_flows_bp, notes_bp, 
    executions_bp, user_roles_bp, pages_bp
)
import logging
import time

def create_app():
    """יצירת אפליקציית Flask"""
    app = Flask(__name__)
    CORS(app, origins=['http://localhost:8080', 'http://127.0.0.1:8080'], 
         supports_credentials=True, allow_headers=['Content-Type', 'Authorization'])
    
    # הגדרת לוגים
    logger = setup_logging()
    app.logger = logger
    
    # יצירת בסיס הנתונים
    init_db()
    
    # רישום blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(tickers_bp)
    app.register_blueprint(accounts_bp)
    app.register_blueprint(trades_bp)
    app.register_blueprint(trade_plans_bp)
    app.register_blueprint(alerts_bp)
    app.register_blueprint(cash_flows_bp)
    app.register_blueprint(notes_bp)
    app.register_blueprint(executions_bp)
    app.register_blueprint(user_roles_bp)
    app.register_blueprint(pages_bp)
    
    # Swagger UI Blueprint
    SWAGGER_URL = '/api/docs'
    API_URL = '/api/swagger.json'
    swaggerui_blueprint = get_swaggerui_blueprint(
        SWAGGER_URL,
        API_URL,
        config={
            'app_name': "TikTrack API Documentation"
        }
    )
    app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)
    
    # OpenAPI JSON endpoint
    @app.route('/api/swagger.json')
    def create_swagger_spec():
        """Create OpenAPI specification"""
        swagger_spec = {
            "openapi": "3.0.0",
            "info": {
                "title": "TikTrack API",
                "version": "1.0.0",
                "description": "TikTrack Trading Application API"
            },
            "servers": [
                {
                    "url": "http://localhost:8080/api/v1",
                    "description": "Development server"
                }
            ],
            "paths": {
                "/auth/login": {
                    "post": {
                        "summary": "User login",
                        "tags": ["Authentication"],
                        "requestBody": {
                            "required": True,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "username": {"type": "string", "example": "admin"},
                                            "password": {"type": "string", "example": "admin123"}
                                        },
                                        "required": ["username", "password"]
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "Login successful",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "status": {"type": "string", "example": "success"},
                                                "data": {
                                                    "type": "object",
                                                    "properties": {
                                                        "token": {"type": "string"},
                                                        "user": {
                                                            "type": "object",
                                                            "properties": {
                                                                "id": {"type": "integer"},
                                                                "username": {"type": "string"},
                                                                "email": {"type": "string"},
                                                                "role": {"type": "string"}
                                                            }
                                                        }
                                                    }
                                                },
                                                "message": {"type": "string", "example": "Login successful"}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "/tickers": {
                    "get": {
                        "summary": "Get all tickers",
                        "tags": ["Tickers"],
                        "responses": {
                            "200": {
                                "description": "List of tickers",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "status": {"type": "string"},
                                                "data": {
                                                    "type": "array",
                                                    "items": {
                                                        "type": "object",
                                                        "properties": {
                                                            "id": {"type": "integer"},
                                                            "symbol": {"type": "string"},
                                                            "name": {"type": "string"},
                                                            "type": {"type": "string"},
                                                            "currency": {"type": "string"}
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "/accounts": {
                    "get": {
                        "summary": "Get all accounts",
                        "tags": ["Accounts"],
                        "responses": {
                            "200": {
                                "description": "List of accounts",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "status": {"type": "string"},
                                                "data": {
                                                    "type": "array",
                                                    "items": {
                                                        "type": "object",
                                                        "properties": {
                                                            "id": {"type": "integer"},
                                                            "name": {"type": "string"},
                                                            "currency": {"type": "string"},
                                                            "status": {"type": "string"},
                                                            "cash_balance": {"type": "number"}
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "components": {
                "securitySchemes": {
                    "bearerAuth": {
                        "type": "http",
                        "scheme": "bearer",
                        "bearerFormat": "JWT"
                    }
                }
            },
            "security": [
                {
                    "bearerAuth": []
                }
            ]
        }
        return jsonify(swagger_spec)
    
    # Middleware ללוגים
    @app.before_request
    def before_request():
        g.start_time = time.time()
        logger.info(f"Request: {request.method} {request.path}")
    
    @app.after_request
    def after_request(response):
        if hasattr(g, 'start_time'):
            duration = time.time() - g.start_time
            logger.info(f"Response: {response.status_code} - {duration:.2f}s")
        return response
    
    @app.errorhandler(404)
    def not_found(error):
        logger.warning(f"404 Error: {request.path}")
        return {"error": "Not found"}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"500 Error: {str(error)}")
        return {"error": "Internal server error"}, 500
    
    return app

app = create_app()

if __name__ == "__main__":
    print(f"🚀 Starting server on {HOST}:{PORT}")
    print(f"📁 UI Directory: {UI_DIR}")
    print(f"🔧 Debug Mode: {DEBUG}")
    print(f"📚 API Documentation: http://{HOST}:{PORT}/api/docs")
    app.run(debug=DEBUG, host=HOST, port=PORT)
