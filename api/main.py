"""
FastAPI Application Entry Point
Task: 20.1.8
Status: COMPLETED

Main FastAPI application with all routes and middleware.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging
import os

from .core.config import settings
from .routers import auth, users, api_keys

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

# Initialize rate limiter and attach to app state
# Import limiter from users router (shared instance)
from .routers.users import limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
# In production, set ALLOWED_ORIGINS environment variable (comma-separated)
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",") if os.getenv("ALLOWED_ORIGINS") else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(users.router, prefix=settings.api_v1_prefix)
app.include_router(api_keys.router, prefix=settings.api_v1_prefix)


@app.get("/health")
async def health_check():
    """System health check."""
    return {"status": "ok"}


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


if __name__ == "__main__":
    import uvicorn
    # Backend API runs on port 8082 (Frontend V2 uses port 8080 per Master Blueprint)
    uvicorn.run(app, host="0.0.0.0", port=8082)
