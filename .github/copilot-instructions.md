# SportConnect: Copilot Instructions

SportConnect is a mobile app for discovering and joining local sporting events. The monorepo contains a Vue 3 frontend and a FastAPI backend.

## General Guidelines

- Follow existing code style and patterns
- Use the appropriate package manager for each workspace (npm for frontend, uv for backend)
- Keep frontend code in TypeScript

## Architecture Overview

**Frontend** (`./frontend`): Vue 3 + Vite SPA with Vuetify UI components and Tailwind CSS
**Backend** (`./backend`): FastAPI REST API with SQLAlchemy ORM, MySQL database, and Redis caching
**Database**: MySQL with Alembic migrations
**Auth**: JWT-based authentication with OAuth integration support

The backend serves the API at `/api/v1` and uses dependency injection for database sessions and configuration.

---

## Frontend Development

### Stack
- Framework: Vue 3 + Vite
- UI Library: Vuetify
- Styling: Tailwind CSS
- State Management: Pinia
- i18n: Vue I18n
- Routing: Vue Router
- Linting: ESLint

### Key Conventions

**UI Components:** Always prioritize Vuetify components and utilities over native CSS. Use Tailwind for responsive design and spacing. Reserve native CSS only for edge cases that cannot be solved with frameworks.

**For all frontend tasks:** Load and follow the Tailwind design system skill, senior frontend skill, and Vuetify MCP documentation to ensure consistency.

### Build & Run

```bash
cd frontend
npm install
npm run dev          # Development server
npm run build-only   # Production build
npm run preview      # Preview built app
```

---

## Backend Development

### Stack
- Framework: FastAPI 0.115+
- ORM: SQLAlchemy 2.0+
- Database: MySQL with PyMySQL
- Caching: Redis
- Auth: JWT (PyJWT) + bcrypt
- Python: 3.13+
- Dependency Management: uv

### Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app factory (lifespan, middleware, routers)
│   ├── config.py            # Settings (Pydantic) - reads from .env
│   ├── database.py          # SQLAlchemy engine, SessionLocal, get_db()
│   ├── dependencies.py      # FastAPI Depends() helpers
│   ├── security.py          # JWT token handling
│   ├── redis_client.py      # Redis connection
│   ├── models/              # SQLAlchemy models (User, OAuthAccount)
│   ├── schemas/             # Pydantic schemas for request/response
│   ├── routers/             # Route handlers (auth.py, oauth.py)
│   └── middleware/          # Custom middleware (CORS, security headers, rate limiting)
├── alembic/                 # Database migrations
└── pyproject.toml           # Dependencies and dev tools
```

### Environment Setup

1. Copy `.env.example` to `.env` and fill in required values:
   - `MYSQL_PASSWORD` (required)
   - `SECRET_KEY` (required for JWT)
   - `REDIS_URL`, `MYSQL_*` (defaults provided)

2. Install dependencies:
   ```bash
   cd backend
   uv sync              # Install all dependencies + dev tools
   ```

### Running the Server

```bash
cd backend
uv run python -m fastapi run      # Development (auto-reload on http://127.0.0.1:8000)
uv run python -m uvicorn app.main:app --host 0.0.0.0 --port 5000  # Production-like
```

API docs available at `/docs` (Swagger) or `/redoc` in development only.

### Database Migrations

Alembic manages schema changes. Configuration reads `DATABASE_URL` from `app.config.get_settings()`.

```bash
cd backend
uv run alembic upgrade head          # Apply all pending migrations
uv run alembic downgrade -1          # Rollback one migration
uv run alembic revision --autogenerate -m "descriptive message"  # Generate migration
```

### Testing

Run pytest with asyncio support for FastAPI async endpoints:

```bash
cd backend
uv run pytest                    # Run all tests
uv run pytest tests/test_auth.py  # Run single test file
uv run pytest -v -k "test_login"  # Run tests matching pattern
uv run pytest --tb=short         # Shorter traceback output
```

### Key Patterns & Conventions

**Dependency Injection**: Use `Depends()` for database sessions and config:
```python
from app.dependencies import DBSession
async def endpoint(db: DBSession):
    ...
```

**Async/await**: All endpoints and database queries are async-first (FastAPI with async SQLAlchemy).

**Settings**: Access config via `get_settings()` from `app.config`. Values come from `.env` (Pydantic BaseSettings).

**Models**: Use SQLAlchemy 2.0 style with `Mapped` annotations and `mapped_column()`. Relationships use `relationship()` with `back_populates`.

**Middleware Order**: CORS must be added first, then SecurityHeaders, then routers.

**Security**: 
- JWT tokens with RS256 or HS256
- Passwords hashed with bcrypt
- OAuth integration via `OAuthAccount` model with `back_populates` to User

---

## Deployment: Coolify

SportConnect uses **Coolify** for containerized deployment across dev, UAT, and production environments. All code changes must be deployment-aware.

### Infrastructure Overview

**Environments** (multi-environment setup with git branch tracking):
- **Dev**: `sport-dev.dresch.dev.br` (frontend), `api-sport-dev.dresch.dev.br` (backend)
  - Git Branch: `dev`
  - MySQL Database: `sportconnect_dev`
- **UAT**: `sport-uat.dresch.dev.br` (frontend), `api-sport-uat.dresch.dev.br` (backend)
  - Git Branch: `uat`
  - MySQL Database: `sportconnect_uat`
- **Production**: `sport.dresch.dev.br` (frontend), `api-sport.dresch.dev.br` (backend)
  - Git Branch: `main`
  - MySQL Database: `sportconnect_prd`

**Applications** (all running and healthy):
- `sportconnect-backend-dev` (Docker, Python 3.13 + FastAPI)
- `sportconnect-backend-uat` (Docker, Python 3.13 + FastAPI)
- `sportconnect-backend-prd` (Docker, Python 3.13 + FastAPI)
- `sportconnect-frontend-dev` (Nixpacks build, Vue 3 SPA via Node.js)
- `sportconnect-frontend-uat` (Nixpacks build, Vue 3 SPA via Node.js)
- `sportconnect-frontend-prd` (Nixpacks build, Vue 3 SPA via Node.js)

**Databases** (MySQL 8):
- One MySQL instance per environment (dev/uat/prd) — isolated databases
- Credentials managed by Coolify, injected as env vars to apps

**Reverse Proxy**: Traefik v3.6
- Auto-routes via domain matching
- TLS/SSL with Let's Encrypt (auto-renewal)
- HTTP→HTTPS redirects enabled
- GZIP compression, security headers

**Source Control Integration**: GitHub App
- Auto-deploys on git push to tracked branches
- Dev branch → Dev environment, uat → UAT, main → Production

### Docker & Build

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM python:3.13-slim
# Uses uv for fast dependency installation
# Runs: uv sync --no-dev
# Exposes port 5000
# CMD: FastAPI on port 5000
```

**Frontend Dockerfile** (`frontend/Dockerfile`):
```dockerfile
FROM node:22-alpine
# Runs: npm install, npm run dev (Vite)
# Exposes port 3000
```

**Coolify Build Process**:
1. **Backend**: Uses Dockerfile build pack (explicit Dockerfile in repo)
2. **Frontend**: Uses Nixpacks build pack (auto-detects Node.js, builds production bundle)
3. Health checks enabled for backend (GET `/api/v1/health` on port 5000)

### Environment Variables

Backend environment variables are injected by Coolify at runtime:
- `SECRET_KEY` — JWT signing key (dev-specific value in dev env)
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`
- `REDIS_URL` — Redis connection (managed by Coolify)
- `ALLOWED_ORIGINS` — CORS whitelist (set per environment)
- `HTTPS` — Set to `true` for production (enforces HTTPS URLs)
- `APP_ENV` — `development`, `staging`, or `production`
- OAuth credentials (if configured)

Local `.env` should NOT be committed. Use `.env.example` as template.

### Deployment Workflow

1. **Local Development**: Use `docker-compose.yml` to run full stack locally
2. **Push to GitHub**: Commit to `dev`, `uat`, or `main` branch
3. **GitHub App Triggers**: Coolify webhook auto-detected on push
4. **Build & Deploy**: 
   - Dockerfile/Nixpacks builds Docker image
   - Container pushed to Coolify's registry
   - Old container stopped, new container started
   - Health checks verify app is healthy
5. **Live**: Access via environment domain (e.g., `api-sport-dev.dresch.dev.br/api/v1/health`)

### Database Migrations

Migrations run **during backend startup** (not as separate step in Coolify):
```bash
# In docker-compose.yml (dev):
uv run alembic upgrade head && uv run fastapi dev app/main.py
```
For production deploys, ensure migrations are idempotent (Alembic best practice).

### Testing Changes Before Production

1. **Local**: `docker-compose up` tests full stack
2. **Dev Environment**: Push to `dev` branch → auto-deploys to dev domain
3. **UAT Environment**: Push to `uat` branch → auto-deploys to uat domain
4. **Production**: Push to `main` branch → auto-deploys to production domain

### Using Coolify MCP Tools

Available tools for deployment operations:
- `coolify-deploy` — Deploy by tag/UUID (manual trigger if needed)
- `coolify-deployment` — View deployment logs, check status, cancel builds
- `coolify-control` — Start/stop/restart apps or databases
- `coolify-application` — Get app config, view details
- `coolify-env_vars` — Read/update environment variables
- `coolify-application_logs` — Tail real-time logs
- `coolify-get_infrastructure_overview` — View all apps/databases/status

---

## Using MCP for Documentation

Use Context7 MCP to fetch current docs for libraries, frameworks, and SDKs (FastAPI, SQLAlchemy, etc.) — even if you think you know the answer. This ensures you have the latest syntax and features.

**Exception:** For Vuetify questions, use the Vuetify MCP instead.

Do NOT use for: refactoring, business logic debugging, code review, or general programming concepts.

### Steps
1. Start with `resolve-library-id` (library name + question) unless you have an exact ID
2. Pick the best match (highest benchmark score, High/Medium reputation preferred)
3. `query-docs` with the selected ID and your full question
4. If unsatisfied, try `query-docs` again with `researchMode: true` for deeper research
