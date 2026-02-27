FROM python:3.13-slim AS builder

WORKDIR /app

COPY pyproject.toml ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
    "alembic>=1.18.4" \
    "fastapi[standard]>=0.129.0" \
    "httpx>=0.28.1" \
    "loguru>=0.7.3" \
    "pydantic-settings>=2.13.1" \
    "sqlmodel>=0.0.35"

# ---- Production ----
FROM python:3.13-slim AS runner

WORKDIR /app

# Create non-root user
RUN groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup appuser

COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .

USER appuser

EXPOSE 8888

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8888"]
