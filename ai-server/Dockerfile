FROM python:3.13-slim

WORKDIR /app

ENV PRISMA_BINARY_CACHE_DIR=/app/.prisma-cache

RUN apt-get update && apt-get install -y --no-install-recommends \
    libatomic1 \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast dependency resolution
RUN pip install --no-cache-dir uv

# Copy dependency files first for layer caching
COPY pyproject.toml uv.lock* ./

# Install all project dependencies from pyproject.toml
RUN uv pip install --system --no-cache -r pyproject.toml 2>/dev/null \
    || uv pip install --system --no-cache \
        "fastapi[standard]>=0.129.0" \
        "uvicorn[standard]>=0.34.0" \
        "httpx>=0.28.1" \
        "loguru>=0.7.3" \
        "pydantic-settings>=2.13.1" \
        "python-dotenv>=1.1.0" \
        "openai>=2.24.0" \
        "langchain>=0.3" \
        "langchain-openai>=0.3" \
        "prisma>=0.15.0" \
        "psycopg2-binary>=2.9.11" \
        "sqlmodel>=0.0.35" \
        "alembic>=1.18.4" \
        "firecrawl-py>=4.18.1" \
        "apify-client>=2.5.0" \
        "chromadb>=1.5.1" \
        "langchain-chroma>=0.2"

COPY . .

RUN prisma generate --schema prisma/schema.prisma \
    && python -m prisma py fetch

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
