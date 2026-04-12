# CI Root Cause Analysis

**Date:** 2026-04-12  
**Pipeline:** GitHub Actions CI/CD Pipeline  
**Failing job:** Server (Express API) → Lint step  
**Run IDs (all failing):** 24297811278, 23554714558, 23554648642, 23554460082, 23553903315

---

## Exact Failing Step

```
Server (Express API) → Lint
```

Command: `npm run lint` → `eslint .`

## Exact Error Message

```
/home/runner/work/EducAI/EducAI/server/tests/chat.test.js
  28:1  error  'global' is not defined  no-undef

✖ 1 problem (1 error, 0 warnings)

Process completed with exit code 1.
```

## Root Cause

`server/tests/chat.test.js` line 28 assigns `global.fetch = mockFetch` to mock the Node.js `fetch` global.  
The `server/eslint.config.js` test-file override block defined `describe`, `it`, `expect`, etc. but did **not** declare `global` as a known identifier, causing the `no-undef` error.

## Fix Applied

**File:** `server/eslint.config.js`  
**Change:** Added `global: 'readonly'` and `fetch: 'writable'` to the test-file globals block:

```js
{
  files: ['tests/**/*.js'],
  languageOptions: {
    globals: {
      // ... existing entries ...
      global: 'readonly',    // ← added
      fetch: 'writable',     // ← added (allows global.fetch = mockFetch)
    },
  },
},
```

## Secondary Fixes (same commit)

1. **Unused imports in `ScholarshipsClient.tsx`** — `ChevronDown`, `ChevronRight`, `Filter`, `getEligibleScholarships`, `getUpcomingScholarshipDeadlines` were imported but never used → removed
2. **Unused import in `AgentPageClient.tsx`** — `X` icon imported but unused → removed  
3. **Trailing whitespace in `ai-server/tests/test_api.py`** — fixed by `ruff check --fix`

## Verification Performed

After the fix, ran locally:
```
cd server && npm run lint  → exit 0 (clean)
cd server && npm run build → exit 0 (tsc clean)
cd server && npm test      → 62 tests passed, 5 suites
cd web    && npm run lint  → exit 0 (clean)
cd web    && npm run build → exit 0 (31 routes, no errors)
```

## Commit

```
1297782  fix(ci): resolve failing pipeline - ESLint global not defined in tests
```

## Why Subsequent Runs Also Failed

The same ESLint error was present in all runs since commit `9d010e4` (feat: server /chat endpoint + mount), which introduced `tests/chat.test.js`. Every push after that inherited the failure.

---

## Prevention

- Keep `server/eslint.config.js` test globals in sync when new Node.js globals are used in tests
- The CI lint step now runs clean from a cold install (`npm ci`)
