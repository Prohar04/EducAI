import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT, decodeJwt } from "jose";

const secretKey = process.env.SESSION_SECRET_KEY || "";
const encodedKey = new TextEncoder().encode(secretKey);
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const REMEMBER_ME_TIMEOUT_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function toSignin(req: NextRequest, reason?: string, clearSession?: boolean) {
  const url = req.nextUrl.clone();
  url.pathname = "/auth/signin";
  if (reason) url.searchParams.set("reason", reason);
  const res = NextResponse.redirect(url);
  if (clearSession) res.cookies.delete("session");
  return res;
}

export async function middleware(req: NextRequest) {
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
        } else {
          // Refresh token expired / not found — force re-login
          return toSignin(req, "session_expired", true);
        }
      }
    } catch {
      // decodeJwt failure or network error — proceed with existing tokens
    }

    // ── Re-sign session cookie with updated tokens + lastActiveAt ───
    const now = Date.now();
    const rememberMe = session.rememberMe ?? false;
    const ttlDays = rememberMe ? 30 : 15;
    const expiredAt = new Date(now + ttlDays * 24 * 60 * 60 * 1000);

    const updatedPayload = { ...session, accessToken, refreshToken, lastActiveAt: now };
    const newToken = await new SignJWT(updatedPayload as unknown as Record<string, unknown>)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(rememberMe ? "30d" : "15d")
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

