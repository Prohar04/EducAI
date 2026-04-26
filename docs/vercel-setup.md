# Vercel Setup — EducAI Frontend

## Prerequisites
- Vercel account (free tier is sufficient)
- GitHub repo connected to Vercel
- Express API deployed on Render (need its URL)

## Step-by-step

### 1. Import project on Vercel
- Go to vercel.com → New Project → import from GitHub
- Select the `EducAI` repo

### 2. Configure build settings
| Setting | Value |
|---------|-------|
| Framework Preset | Next.js (auto-detected) |
| Root Directory | `web` |
| Build Command | `npm run build` (default) |
| Output Directory | `.next` (default) |
| Install Command | `npm ci` (default) |
| Node.js Version | 22.x |

### 3. Set environment variables
Add these in Vercel → Project → Settings → Environment Variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | |
| `SESSION_SECRET_KEY` | *(generate)* | `openssl rand -base64 32` — must be 32+ chars |
| `BACKEND_URL` | `https://<api>.onrender.com` | Your Render Express URL, no trailing slash |
| `NEXT_PUBLIC_FRONTEND_URL` | `https://<your-app>.vercel.app` | Your Vercel deployment URL |
| `JWT_SECRET` | *(same as Express JWT_SECRET)* | Used for Google OAuth JWT verification in the callback route |

**Important**: `BACKEND_URL` is server-side only (no `NEXT_PUBLIC_` prefix). Next.js uses it only in Server Actions and API routes — the browser never sees it.

### 4. Deploy
- Push to `main` → automatic deployment
- Or use `vercel --prod` from CLI

### 5. Update Express CORS
After the first Vercel deployment, copy the production URL (e.g. `https://educai.vercel.app`) and set `FRONTEND_URL` on your Render Express service to that value.

If you use Vercel preview deployments, add them comma-separated:
```
FRONTEND_URL=https://educai.vercel.app,https://educai-git-main.vercel.app
```

### 6. Google OAuth callback
The Google OAuth flow redirects via the Express backend. The Next.js frontend only receives a one-time code at `/api/auth/google/callback`. No changes needed in Next.js — just ensure Express's `GOOGLE_CALLBACK_URL` is correct.

## Notes on session cookies

The session cookie is an HS256 JWT set by Next.js on the `*.vercel.app` domain. All Express API calls happen server-side (Server Actions / API routes) — the browser never directly calls `*.onrender.com`. This means:

- No cross-domain cookie issues
- `sameSite: lax` is correct for same-origin Next.js session cookie
- The Express refresh token exchange is server-to-server via `Cookie` header forwarded from Next.js middleware

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `SESSION_SECRET_KEY is missing` error | Env var not set | Add to Vercel env vars |
| Redirect loops on `/app` | `BACKEND_URL` wrong or Express down | Check Express health, verify URL |
| Google OAuth fails | `BACKEND_URL` path or `JWT_SECRET` mismatch | Ensure `JWT_SECRET` matches Express |
| 502 on chat | Express/AI server cold start | Wait 30s, Render free tier wakes up |
