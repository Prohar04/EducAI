#!/usr/bin/env bash
set -euo pipefail

SCHEMA_PATH="${PRISMA_SCHEMA_PATH:-prisma/schema.prisma}"
CACHE_DIR="${PRISMA_BINARY_CACHE_DIR:-.prisma-cache}"

export PRISMA_BINARY_CACHE_DIR="$CACHE_DIR"
export PRISMA_CLIENT_ENGINE_TYPE="${PRISMA_CLIENT_ENGINE_TYPE:-binary}"
export PRISMA_PY_CONFIG_ENGINE_TYPE="${PRISMA_PY_CONFIG_ENGINE_TYPE:-binary}"

python -m prisma generate --schema "$SCHEMA_PATH"
python -m prisma py fetch

ENGINE_NAME="$(python - <<'PY'
from prisma.engine.utils import query_engine_name

print(query_engine_name())
PY
)"

SOURCE_ENGINE="$(find "$CACHE_DIR/node_modules/prisma" -type f -name 'query-engine-*' | head -n 1)"

if [[ -z "$SOURCE_ENGINE" ]]; then
  echo "Prisma query engine was not downloaded into $CACHE_DIR/node_modules/prisma" >&2
  exit 1
fi

mkdir -p "$CACHE_DIR"
cp "$SOURCE_ENGINE" "$CACHE_DIR/$ENGINE_NAME"
cp "$SOURCE_ENGINE" "./$ENGINE_NAME"
chmod +x "$CACHE_DIR/$ENGINE_NAME" "./$ENGINE_NAME"

echo "Prisma query engine ready at $CACHE_DIR/$ENGINE_NAME"