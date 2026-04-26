# Repository Cleanup Audit

**Date:** 2026-04-26
**Audited by:** Prohar Saha Polak

---

## Audit Table

| Path | Category | Why It Looks Unnecessary | Proof / Reference | Safe to Remove? | Action Taken |
|------|----------|--------------------------|-------------------|-----------------|--------------|
| `web/components/SIgnInButton.tsx` | Dead component | Not imported in any page, route, or layout. Only defines itself. Component replaced by inline logic. | `grep -rn "SIgnInButton" web/` returns only its own file | Yes | **Removed** |
| `web/components/home/HeroIllustration.tsx` | Dead component | Defined but never imported anywhere in the app | `grep -rn "HeroIllustration" web/` returns only its own file | Yes | **Removed** |
| `web/components/home/RoadmapCards.tsx` | Dead component | Defined but never imported anywhere in the app | `grep -rn "RoadmapCards" web/` returns only its own file | Yes | **Removed** |
| `ai-server/fileStracture.md` | Stale doc | Describes a planned/template structure with a typo in the filename ("Stracture"). Actual structure diverged significantly — no `alembic/`, no `worker/`, no `docker/` subdirectory, etc. | Compare with actual `ai-server/` contents | Yes | **Removed** |
| `docs/generate_pdf.py` | Unused script | One-off PDF generation script accidentally committed to `docs/`. Not referenced in README, CI, or any other file. Produces `EducAI_Project_Overview.pdf` which is not tracked. | `grep -rn "generate_pdf"` returns only the file itself | Yes | **Removed** |
| `docs/reality-check.md` | Stale doc | Pre-migration (2026-04-19) reality check referencing OpenRouter as the primary provider. Superseded by `docs/final-reality-check.md` which has the same format with corrected post-migration data. | Compare dates and provider references between the two files | Yes | **Removed** |
| `scripts/auto-commit-progress.sh` | Dead code in file | Script contained `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>` hardcoded in commit message template | Line 84 of original file | Partial fix | **Fixed** (Co-Authored-By trailer removed) |
| `.gitignore` | Incomplete config | Missing entries for `*.log`, `logs/`, `ai-server/logs/`, generated PDFs, and editor swap files | `ai-server/logs/api.log` exists untracked but could accidentally be staged | N/A | **Updated** |
| `skills-lock.json` | Editor/local file | Claude Code harness lockfile for installed skills. Not referenced by any build/CI/runtime. | No references in CI, package.json, or runtime | Maybe | **Kept** — lockfile that tracks project skill versions; low risk |
| `docs/ai-provider-audit.md` | Reference doc | Current AI provider inventory — still accurate and useful | Cross-referenced with services | No | **Kept** |
| `docs/final-launch-checklist.md` | Historical doc | Completed launch checklist from 2026-04-20 | Fully checked off | Maybe | **Kept** — historical record |
| `docs/final-reality-check.md` | Reference doc | Most recent feature verification table | Post-migration, still accurate | No | **Kept** |
| `docs/final-status.md` | Reference doc | Module completion summary | Still accurate | No | **Kept** |
| `docs/openai-migration-plan.md` | Historical doc | Completed migration plan | Migration is done | Maybe | **Kept** — explains what changed and why |
| `docs/showcase-readiness.md` | Reference doc | Demo flow and UX checkpoints | Still useful for demos | No | **Kept** |
| `.vscode/settings.json` | Editor config | Team-shared editor settings for Python/CSS | Configures ruff, CSS lint ignore, Python interpreter path — useful for contributors | No | **Kept** |
| `.github/workflows/ci-cd.yml` | CI config | Core CI pipeline | Active — runs on every push | No | **Kept** |
| `.github/workflows/data-sync.yml` | CI config | Daily data sync cron | Active — runs at 06:00 UTC | No | **Kept** |
| `.github/workflows/scholarship-alerts.yml` | CI config | Daily scholarship deadline alerts | Active — runs at 08:00 UTC | No | **Kept** |
| `docker-compose.yml` | Config | Local development setup | May be used for local dev | No | **Kept** |

---

## Summary

- **Files removed:** 6
- **Files fixed:** 1 (`scripts/auto-commit-progress.sh`)
- **`.gitignore` updated:** Yes
- **Files kept as-is:** All others
