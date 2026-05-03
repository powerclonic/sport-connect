FROM python:3.13-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install dependencies first (cache layer)
COPY pyproject.toml .
RUN uv sync --no-dev --no-install-project

# Copy application code
COPY . .

EXPOSE 5000
