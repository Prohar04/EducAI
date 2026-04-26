# Repository Cleanup Actions

**Date:** 2026-04-26

---

## Part A — Remove Claude Contributor Attribution

### Root Cause
All commits had `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>` trailers in their commit message bodies. GitHub treats `Co-Authored-By` lines as co-authorship and surfaces contributors in the repository's Contributors graph.

No commits were directly authored by Claude (all `git log --format="%an <%ae>"` entries showed `Prohar Saha Polak <Prohar04@users.noreply.github.com>`).

### Method
Used `git-filter-repo` with a Python commit-callback to strip `Co-Authored-By: Claude` lines from all 228 commit messages:

```python
import re
msg = commit.message.decode('utf-8', errors='replace')
msg = re.sub(r'\nCo-Authored-By: Claude[^\n]*', '', msg, flags=re.IGNORECASE)
msg = msg.rstrip('\n') + '\n'
commit.message = msg.encode('utf-8')
```

**Commits affected:** 64 out of 228 had Claude trailers.
**Commits rewritten:** All 228 (git-filter-repo rewrites all commits to maintain consistency).
**Backup tag created before rewrite:** `backup/before-claude-removal`

### Verification
- Full scan of all 228 new commit messages: zero `Co-Authored-By: Claude` matches
- Server build: `tsc` passes with zero errors
- Web build: Next.js production build passes (all routes compiled)

---

## Part B — Dead Code and File Cleanup

### Files Removed

| File | Reason |
|------|--------|
| `web/components/SIgnInButton.tsx` | Dead component — never imported in any file |
| `web/components/home/HeroIllustration.tsx` | Dead component — never imported in any file |
| `web/components/home/RoadmapCards.tsx` | Dead component — never imported in any file |
| `ai-server/fileStracture.md` | Stale planning doc with typo; actual structure diverged entirely |
| `docs/generate_pdf.py` | One-off script in wrong directory; not referenced or usable from CI |
| `docs/reality-check.md` | Pre-migration audit from 2026-04-19; superseded by `final-reality-check.md` |

### Files Fixed

| File | Change |
|------|--------|
| `scripts/auto-commit-progress.sh` | Removed hardcoded `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>` from commit message template (line 84) |

### `.gitignore` Updates

Added entries to prevent future tracking of:
- `*.log` — application log files
- `logs/` — log directories
- `ai-server/logs/` — explicit ai-server log path
- `docs/*.pdf` and `*.pdf` — generated PDF artifacts
- `*.swp`, `*.swo`, `*~` — editor swap/backup files

---

## Part C — Builds and Tests

| Check | Result |
|-------|--------|
| `server/` TypeScript build (`tsc`) | ✅ Passes |
| `server/` ESLint | ✅ Passes |
| `web/` Next.js production build | ✅ Passes (all routes compile) |
| `web/` ESLint | ✅ Passes |
| All routes present after cleanup | ✅ Verified |
| No missing imports after file deletions | ✅ Verified (dead files had no importers) |

---

## "Maybe Unused" Files Intentionally Left

These files showed ambiguity and were left untouched:

| File | Why Left |
|------|----------|
| `skills-lock.json` | Claude Code harness lockfile; harmless and tracks installed project skills |
| `docs/final-launch-checklist.md` | Historical record of launch state |
| `docs/openai-migration-plan.md` | Documents the reasoning behind provider migration |
| `docs/showcase-readiness.md` | Demo flow reference for presentations |
