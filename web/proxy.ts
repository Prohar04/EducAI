import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT, decodeJwt } from "jose";

const secretKey = process.env.SESSION_SECRET_KEY || "";
const encodedKey = new TextEncoder().encode(secretKey);
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

// Sessions live for 30 days regardless of the "remember me" choice — the
// access + refresh tokens are both minted with a 30-day TTL, so there is no
// reason to expire the browser session sooner. (Previously non-remember-me
// sessions were killed after 15 minutes of inactivity, which logged Google
// and plain sign-in users out "after some time".)
const IDLE_TIMEOUT_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const REMEMBER_ME_TIMEOUT_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function toSignin(req: NextRequest, reason?: string, clearSession?: boolean) {
  const url = req.nextUrl.clone();
  url.pathname = "/auth/signin";
  if (reason) url.searchParams.set("reason", reason);
  const res = NextResponse.redirect(url);
  if (clearSession) res.cookies.delete("session");
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const cookie = req.cookies.get("session")?.value;
  if (!cookie) return toSignin(req);

  try {
    const { payload } = await jwtVerify(cookie, encodedKey, {
      algorithms: ["HS256"],
    });

    const session = payload as {
      user: { id: string; name: string; email: string; avatarUrl?: string; emailVerified: boolean; isActive: boolean };
      accessToken: string;
      refreshToken: string;
      rememberMe?: boolean;
      lastActiveAt?: number;
    };

    // ── Idle timeout (only for /app paths) ──────────────────────────
    if (pathname.startsWith("/app")) {
      const now = Date.now();
      const lastActive = session.lastActiveAt ?? now;
      const rememberMe = session.rememberMe ?? false;
      const idleLimit = rememberMe ? REMEMBER_ME_TIMEOUT_MS : IDLE_TIMEOUT_MS;

      if (now - lastActive > idleLimit) {
        return toSignin(req, "session_expired", true);
      }
    }

    // ── Proactive access token refresh ──────────────────────────────
    let { accessToken, refreshToken } = session;

    try {
      const decoded = decodeJwt(accessToken);
      const exp = decoded.exp as number | undefined;
      // Refresh if already expired or within 60 s of expiry
      if (exp !== undefined && Date.now() / 1000 >= exp - 60) {
        const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
          method: "POST",
          headers: { Cookie: `refreshToken=${refreshToken}` },
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          accessToken = data.accessToken;
          refreshToken = data.refreshToken;
        } else if (refreshRes.status === 401 || refreshRes.status === 403) {
          // The refresh token really is invalid or revoked. Clearing the
          // session is correct here.
          return toSignin(req, "session_expired", true);
        } else {
          // Anything else — 5xx, a gateway error, an API mid-redeploy — is a
          // problem with the request, not proof that the user's session is
          // invalid. Destroying the cookie on a transient failure logged people
          // out at random, and because cookies are shared across tabs a single
          // failed refresh in a stale background tab signed them out
          // everywhere. Keep the existing tokens and let the next request try
          // again.
          console.warn(
            `[proxy] token refresh failed with ${refreshRes.status}; keeping session`,
          );
        }
      }
    } catch {
      // decodeJwt failure or network error — proceed with existing tokens
    }

    // ── Re-sign session cookie with updated tokens + lastActiveAt ───
    const now = Date.now();
    const ttlDays = 30;
    const expiredAt = new Date(now + ttlDays * 24 * 60 * 60 * 1000);

    const updatedPayload = { ...session, accessToken, refreshToken, lastActiveAt: now };
    const newToken = await new SignJWT(updatedPayload as unknown as Record<string, unknown>)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(encodedKey);

    const response = NextResponse.next();
    response.cookies.set("session", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiredAt,
      sameSite: "lax",
      path: "/",
    });
    return response;
  } catch {
    // Invalid session JWT
    return toSignin(req, undefined, true);
  }
}

export const config = {
  matcher: ["/app/:path*", "/onboarding", "/onboarding-check"],
};

