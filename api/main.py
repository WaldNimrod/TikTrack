"""
FastAPI Application Entry Point
Task: 20.1.8
Status: COMPLETED

Main FastAPI application with all routes and middleware.
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging
import os

from .core.config import settings
from .routers import auth, users, api_keys
from .utils.exceptions import HTTPExceptionWithCode, ErrorCodes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="TikTrack Project Phoenix API",
    version="2.5.2",
    description="Unified API Specification (Fortress Protocol)",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Register exception handlers BEFORE routers to ensure they're used
# RequestValidationError handler must be registered early using add_exception_handler
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handler for Pydantic validation errors.
    
    Adds error_code to validation error responses.
    This ensures all validation errors include error_code for frontend handling.
    """
    logger.debug(f"RequestValidationError caught: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "error_code": ErrorCodes.VALIDATION_INVALID_FORMAT
        }
    )

app.add_exception_handler(RequestValidationError, validation_exception_handler)

# Initialize rate limiter and attach to app state
# Import limiter from users router (shared instance)
from .routers.users import limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
# In development, allow localhost:8080 (Frontend) and localhost:8082 (Backend docs)
# In production, set ALLOWED_ORIGINS environment variable (comma-separated)
if os.getenv("ALLOWED_ORIGINS"):
    # Production: Use environment variable
    allowed_origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS").split(",")]
else:
    # Development: Allow localhost origins
    allowed_origins = [
        "http://localhost:8080",  # Frontend
        "http://localhost:8082",   # Backend docs
        "http://127.0.0.1:8080",  # Frontend (alternative)
        "http://127.0.0.1:8082",  # Backend docs (alternative)
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(users.router, prefix=settings.api_v1_prefix)
app.include_router(api_keys.router, prefix=settings.api_v1_prefix)


@app.get("/health")
async def health_check():
    """System health check."""
    return {"status": "ok"}


@app.get("/health/detailed")
async def detailed_health_check():
    """
    Detailed health check - verifies database and AuthService.
    
    Useful for debugging connection issues.
    """
    health_status = {
        "status": "ok",
        "components": {}
    }
    
    # Check database connection
    try:
        from .core.database import AsyncSessionLocal
        from sqlalchemy import text
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        health_status["components"]["database"] = {
            "status": "ok",
            "message": "Database connection successful"
        }
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["components"]["database"] = {
            "status": "error",
            "message": f"Database connection failed: {type(e).__name__}: {str(e)}"
        }
    
    # Check AuthService initialization
    try:
        from .services.auth import get_auth_service
        auth_service = get_auth_service()
        health_status["components"]["auth_service"] = {
            "status": "ok",
            "message": "AuthService initialized successfully"
        }
    except ValueError as e:
        health_status["status"] = "degraded"
        health_status["components"]["auth_service"] = {
            "status": "error",
            "message": f"AuthService configuration error: {str(e)}"
        }
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["components"]["auth_service"] = {
            "status": "error",
            "message": f"AuthService initialization failed: {type(e).__name__}: {str(e)}"
        }
    
    # Check environment variables
    import os
    env_vars = {
        "DATABASE_URL": "set" if os.getenv("DATABASE_URL") else "missing",
        "JWT_SECRET_KEY": "set" if os.getenv("JWT_SECRET_KEY") else "missing"
    }
    health_status["components"]["environment"] = env_vars
    
    if health_status["status"] == "degraded":
        return JSONResponse(
            status_code=503,
            content=health_status
        )
    
    return health_status


@app.exception_handler(HTTPExceptionWithCode)
async def http_exception_with_code_handler(request: Request, exc: HTTPExceptionWithCode):
    """Handler for HTTPExceptionWithCode - always includes error_code."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "error_code": exc.error_code
        },
        headers=exc.headers
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Handler for standard HTTPException (fallback for other errors).
    
    Converts to HTTPExceptionWithCode with appropriate error code.
    This ensures all errors have an error_code.
    """
    # Determine appropriate error code based on status code
    if exc.status_code == 401:
        error_code = ErrorCodes.AUTH_UNAUTHORIZED
    elif exc.status_code == 403:
        error_code = ErrorCodes.AUTH_UNAUTHORIZED
    elif exc.status_code == 404:
        error_code = ErrorCodes.USER_NOT_FOUND
    elif exc.status_code == 400:
        error_code = ErrorCodes.VALIDATION_INVALID_FORMAT
    else:
        error_code = ErrorCodes.SERVER_ERROR
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "error_code": error_code
        },
        headers=exc.headers
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled exceptions."""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error_code": ErrorCodes.SERVER_ERROR
        }
    )


if __name__ == "__main__":
    import uvicorn
    # Backend API runs on port 8082 (Frontend V2 uses port 8080 per Master Blueprint)
    uvicorn.run(app, host="0.0.0.0", port=8082)
