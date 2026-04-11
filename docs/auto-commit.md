# Auto-Commit Setup

Script: `scripts/auto-commit-progress.sh`

## What it does

- Stages all tracked modifications and meaningful new files
- Skips empty commits
- Guards against committing `.env`, secrets, `node_modules`, `dist`
- Writes a descriptive commit message with timestamp and file list
- Exits cleanly if nothing to commit

## One-shot usage

```bash
./scripts/auto-commit-progress.sh
```

## Cron (local machine)

Edit your crontab with `crontab -e`:

```cron
# Auto-commit every 30 minutes between 06:00–10:00 on April 13
*/30 6-10 13 4 * cd /Users/prohorsaha/EducAI && ./scripts/auto-commit-progress.sh >> /tmp/educai-auto-commit.log 2>&1
```

## watch loop (terminal)

```bash
watch -n 900 ./scripts/auto-commit-progress.sh
```

## GitHub Actions trigger

If you want the CI to auto-commit progress docs (e.g. progress-log.md), add a workflow:

```yaml
# .github/workflows/auto-commit-docs.yml
name: Auto-commit docs
on:
  push:
    branches: [main]
  schedule:
    - cron: '*/30 0-4 13 4 *'  # every 30 min on April 13 UTC
jobs:
  commit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      - name: Auto-commit progress
        run: |
          git config user.email "bot@educai.app"
          git config user.name "EducAI Bot"
          ./scripts/auto-commit-progress.sh || true
      - name: Push
        run: git push || true
```

## Safety guarantees

- Never commits `.env` or secrets (grep check before staging)
- Never amends previous commits
- Never creates empty commits
- Respects `.gitignore`
