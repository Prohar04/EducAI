# MagiShop Server - Checklist

## Setup

- [x] Install dependencies
- [x] Configure environment variables
- [x] Set up database
- [x] Run migrations

## Authentication

- [x] `POST /auth/signup` — Create account + send verification email
- [x] `POST /auth/signin` — Email/password login (lockout + remember-me)
- [x] `POST /auth/verify-email` — Confirm email with token
- [x] `POST /auth/resend-verification` — Resend verification email
- [x] `POST /auth/refresh` — Rotate refresh token (preserves TTL)
- [x] `POST /auth/signout` — Revoke tokens (requires Bearer)
- [x] `POST /auth/forgot-password` — Send password-reset email
- [x] `POST /auth/reset-password` — Set new password from token
- [x] `GET  /auth/google` — Google OAuth2 redirect
- [x] `GET  /auth/google/callback` — Google OAuth2 callback

### Auth features

| Feature | Details |
|---|---|
| Email verification | New accounts must verify via email link (24 h TTL) before sign-in |
| Account lockout | 5 failed passwords → 10-minute lockout (HTTP 423, `ACCOUNT_LOCKED`) |
| Remember me | `rememberMe: true` → 30-day refresh token; default is 15 days |
| TTL preservation | On token rotation the original TTL is carried forward |
| Password reset | Token-based (30 min TTL), invalidates all refresh tokens |
| Hashing | Argon2id for passwords, SHA-256 for tokens |

## Documentation

- [ ] Document API endpoints
- [ ] Create setup instructions
- [ ] Write usage examples
- [ ] Add troubleshooting guide

## Testing

- [x] Auth endpoint tests (34 tests — signup, signin, lockout, remember-me TTL, email verification, refresh, forgot/reset password)
- [x] Basic API tests (health, 404)
- [ ] Perform load testing
- [ ] Manual testing

Run tests:
```bash
npm test
```

## Deployment

- [ ] Code review
- [ ] Security audit
- [ ] Build production image
- [ ] Deploy to staging
- [ ] Deploy to production

## Monitoring

- [ ] Set up logging
- [ ] Configure alerts
- [ ] Monitor performance
- [ ] Track errors
