#!/usr/bin/env bash
# auto-commit-progress.sh
# ─────────────────────────────────────────────────────────────────────────────
# Commits meaningful tracked changes automatically.
# Safe: no empty commits, no fake timestamps, no secrets.
#
# Usage:
#   ./scripts/auto-commit-progress.sh              # one-shot
#   watch -n 900 ./scripts/auto-commit-progress.sh # poll every 15 min
#
# Cron example (every 30 min between 6am–10am):
#   */30 6-10 * * * cd /path/to/EducAI && ./scripts/auto-commit-progress.sh >> /tmp/auto-commit.log 2>&1
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# ── Safety checks ─────────────────────────────────────────────────────────────

# Don't commit if on detached HEAD
if ! git symbolic-ref HEAD &>/dev/null; then
  echo "[auto-commit] Skipped — detached HEAD."
  exit 0
fi

# Don't commit secrets
SENSITIVE_PATTERNS=('.env$' '\.env\.' 'secret' 'password' 'private_key' 'api_key')
for pattern in "${SENSITIVE_PATTERNS[@]}"; do
  if git diff --cached --name-only | grep -qi "$pattern"; then
    echo "[auto-commit] WARNING: Possible sensitive file staged — aborting."
    exit 1
  fi
done

# ── Check for real changes ────────────────────────────────────────────────────

STAGED=$(git diff --cached --name-only 2>/dev/null)
UNSTAGED=$(git diff --name-only 2>/dev/null)
UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null)

if [ -z "$STAGED" ] && [ -z "$UNSTAGED" ] && [ -z "$UNTRACKED" ]; then
  echo "[auto-commit] Nothing to commit."
  exit 0
fi

# ── Stage meaningful files ────────────────────────────────────────────────────

# Stage tracked modifications
if [ -n "$UNSTAGED" ]; then
  git add -u
fi

# Stage new source files (not .env, not node_modules, not dist, not build)
git ls-files --others --exclude-standard \
  | grep -v "node_modules/" \
  | grep -v "\.env" \
  | grep -v "^dist/" \
  | grep -v "^build/" \
  | grep -v "\.log$" \
  | xargs -r git add --

# ── Re-check after staging ────────────────────────────────────────────────────

STAGED=$(git diff --cached --name-only 2>/dev/null)
if [ -z "$STAGED" ]; then
  echo "[auto-commit] Nothing meaningful to commit after staging."
  exit 0
fi

# ── Build commit message ──────────────────────────────────────────────────────

FILE_COUNT=$(echo "$STAGED" | wc -l | tr -d ' ')
BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "unknown")
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")

MSG="chore(auto): progress snapshot — ${FILE_COUNT} file(s) [${TIMESTAMP}]

Auto-committed by scripts/auto-commit-progress.sh on branch ${BRANCH}.
Files changed:
$(echo "$STAGED" | head -20 | sed 's/^/  - /')

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

# ── Commit ────────────────────────────────────────────────────────────────────

git commit -m "$MSG"
echo "[auto-commit] ✅  Committed ${FILE_COUNT} file(s) at ${TIMESTAMP}"
