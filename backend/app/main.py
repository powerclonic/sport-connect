"""Application factory."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.routers import auth, oauth

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: nothing blocking needed (SQLAlchemy creates pool on first use)
    yield
    # Shutdown: pool cleanup handled by SQLAlchemy


def create_app() -> FastAPI:
    app = FastAPI(
        title="SportConnect API",
        version=settings.APP_VERSION,
        # Disable docs in production
        docs_url=None if settings.APP_ENV == "production" else "/docs",
        redoc_url=None if settings.APP_ENV == "production" else "/redoc",
        openapi_url=None if settings.APP_ENV == "production" else "/openapi.json",
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Must be added before other middleware so preflight responses are correct
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
        expose_headers=["X-Request-ID"],
        max_age=600,
    )

    # ── Security headers ──────────────────────────────────────────────────────
    app.add_middleware(SecurityHeadersMiddleware, https=settings.HTTPS)

    # ── Routers ───────────────────────────────────────────────────────────────
    API_PREFIX = "/api/v1"
    app.include_router(auth.router, prefix=API_PREFIX)
    app.include_router(oauth.router, prefix=API_PREFIX)

    # ── Health check (unauthenticated) ────────────────────────────────────────
    @app.get("/health", tags=["health"])
    def health() -> dict:
        return {"status": "ok", "version": settings.APP_VERSION}

    # ── Global exception handlers ─────────────────────────────────────────────
    @app.exception_handler(401)
    async def unauthorized_handler(request: Request, exc) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": getattr(exc, "detail", "Not authenticated")},
            headers={"WWW-Authenticate": "Bearer"},
        )

    @app.exception_handler(403)
    async def forbidden_handler(request: Request, exc) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": getattr(exc, "detail", "Forbidden")},
        )

    @app.exception_handler(422)
    async def validation_handler(request: Request, exc) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": getattr(exc, "detail", "Validation error")},
        )

    return app


app = create_app()
