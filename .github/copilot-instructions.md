# SportConnect: Copilot Instructions

SportConnect is a mobile app for discovering and joining local sporting events. The monorepo contains a Vue 3 frontend and a Laravel PHP backend.

## General Guidelines

- Follow existing code style and patterns
- Use the appropriate package manager for each workspace (npm for frontend, Composer for backend)
- Keep frontend code in TypeScript
- **Follow TDD (Test-Driven Development)**: write or update tests before implementing features or fixes

---

## Test-Driven Development (TDD)

All code changes must follow the **Red → Green → Refactor** cycle:

1. **Red** — Write a failing test that describes the desired behavior
2. **Green** — Write the minimum code necessary to make the test pass
3. **Refactor** — Clean up the implementation while keeping all tests green

### When to Apply TDD

- **New features**: write feature/unit tests before writing any implementation code
- **Bug fixes**: reproduce the bug with a failing test first, then fix it
- **Refactoring**: ensure tests are passing before and after; do not change behavior

### Backend (Laravel PHPUnit)

Run tests with:
```bash
cd backend
XDEBUG_MODE=off php artisan test          # all tests
XDEBUG_MODE=off php artisan test --filter=AuthTest  # specific suite
```

Test files live in `backend/tests/`:
- `Feature/` — HTTP feature tests using `RefreshDatabase` + `actingAs($user, 'api')`
- `Unit/` — pure unit tests for models and isolated logic

Model factories in `database/factories/` support all models. Use them in tests:
```php
$user = User::factory()->create();
$event = Event::factory()->past()->create();
```

### Frontend (Vitest)

Run tests with:
```bash
cd frontend
npm test            # run all tests once
npm run test:watch  # watch mode
npm run test:coverage  # with coverage report
```

Test files live next to the code in `__tests__/` sub-directories:
- `src/stores/__tests__/` — Pinia store tests
- `src/api/__tests__/` — API module tests

Use `vi.mock('@/api/...')` to mock API modules and `setActivePinia(createPinia())` to reset store state between tests.

---

## Architecture Overview

**Frontend** (`./frontend`): Vue 3 + Vite SPA with Vuetify UI components and Tailwind CSS
**Backend** (`./backend`): Laravel 13 REST API with Eloquent ORM, MySQL database, and Redis caching
**Database**: MySQL with Laravel Migrations (Eloquent)
**Auth**: JWT-based authentication (`tymon/jwt-auth`) with OAuth integration support

The backend serves the API at `/api/v1` with the `auth:api` middleware guarding protected routes.

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
- Framework: Laravel 13
- ORM: Eloquent with UUID primary keys (`HasUuids`)
- Database: MySQL with Laravel Migrations
- Caching: Redis (`predis/predis`)
- Auth: JWT (`tymon/jwt-auth`) + bcrypt
- PHP: 8.3+
- Dependency Management: Composer

### Project Structure

```
backend/
├── app/
│   ├── Http/
│   │   └── Controllers/     # Route handlers (AuthController, EventController, etc.)
│   ├── Models/              # Eloquent models (User, Event, EventParticipant, Rating, …)
│   └── Providers/           # Service providers
├── config/                  # Laravel config files (database, jwt, etc.)
├── database/
│   ├── factories/           # Model factories for testing
│   ├── migrations/          # Database schema migrations
│   └── seeders/             # Database seeders
├── routes/
│   └── api.php              # All API routes (prefixed /api/v1)
├── tests/
│   ├── Feature/             # HTTP feature tests
│   └── Unit/                # Unit tests
├── .env.testing             # Test environment config (SQLite in-memory)
├── phpunit.xml              # PHPUnit config
└── composer.json            # Dependencies and scripts
```

### Environment Setup

1. Copy `.env.example` to `.env` and fill in required values:
   - `DB_PASSWORD` (required for MySQL)
   - `JWT_SECRET` (required for JWT)
   - `REDIS_URL`, `DB_*` (defaults provided)

2. Install dependencies:
   ```bash
   cd backend
   composer install
   php artisan key:generate
   php artisan migrate
   ```

### Running the Server

```bash
cd backend
php artisan serve         # Development (http://127.0.0.1:8000)
```

### Database Migrations

```bash
cd backend
php artisan migrate                     # Apply all pending migrations
php artisan migrate:rollback            # Rollback one batch
php artisan make:migration create_example_table --create=example  # Generate migration
```

### Testing

```bash
cd backend
XDEBUG_MODE=off php artisan test                        # Run all tests
XDEBUG_MODE=off php artisan test --filter=AuthTest      # Run specific test class
XDEBUG_MODE=off php artisan test --filter=test_login    # Run tests matching pattern
```

Tests use SQLite in-memory; configuration lives in `phpunit.xml` (no separate `.env.testing` file is needed). `RefreshDatabase` is used in feature tests to reset state between runs.

### Key Patterns & Conventions

**Route Protection**: Use `auth:api` middleware. Tests use `actingAs($user, 'api')`.

**JWT Auth**: Tokens issued with `JWTAuth::fromUser($user)`. Test authentication with `actingAs($user, 'api')`.

**Models**: Use Eloquent with `HasUuids` and `HasFactory` traits. Add `HasFactory` to every model that needs a factory.

**Factories**: `User`, `Event`, `EventParticipant`, and `Rating` models have factories in `database/factories/`. EventFactory has state methods: `past()`, `withCapacity(int)`, `cancelled()`. (`OAuthAccount` does not have a factory.)

**Security**: 
- JWT tokens with HS256 (`JWT_SECRET`)
- Passwords hashed with bcrypt
- OAuth integration via `OAuthAccount` model

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
- `sportconnect-backend-dev` (Docker, PHP 8.3 + Laravel + FrankenPHP)
- `sportconnect-backend-uat` (Docker, PHP 8.3 + Laravel + FrankenPHP)
- `sportconnect-backend-prd` (Docker, PHP 8.3 + Laravel + FrankenPHP)
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
- `JWT_SECRET` — JWT signing key (dev-specific value in dev env)
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `REDIS_URL` — Redis connection (managed by Coolify)
- `ALLOWED_ORIGINS` — CORS whitelist (set per environment)
- `APP_ENV` — `local`, `staging`, or `production`
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
php artisan migrate --force && php artisan config:cache && php artisan route:cache && frankenphp run
```
For production deploys, ensure migrations are idempotent (Laravel best practice).

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

Use Context7 MCP to fetch current docs for libraries, frameworks, and SDKs (Laravel, Eloquent, Vue, etc.) — even if you think you know the answer. This ensures you have the latest syntax and features.

**Exception:** For Vuetify questions, use the Vuetify MCP instead.

Do NOT use for: refactoring, business logic debugging, code review, or general programming concepts.

### Steps
1. Start with `resolve-library-id` (library name + question) unless you have an exact ID
2. Pick the best match (highest benchmark score, High/Medium reputation preferred)
3. `query-docs` with the selected ID and your full question
4. If unsatisfied, try `query-docs` again with `researchMode: true` for deeper research
