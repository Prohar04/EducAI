"use client";

import { useEffect } from "react";

// Mirrors the (server-side, httpOnly-cookie-backed) session tokens into
// localStorage for client-side JS that needs to read them directly. The
// httpOnly cookie session remains the source of truth for all server-side
// auth (authFetch, server actions) — this is an additive copy only.
export function TokenStorageSync({
	accessToken,
	refreshToken,
}: {
	accessToken: string;
	refreshToken: string;
}) {
	useEffect(() => {
		try {
			localStorage.setItem("accessToken", accessToken);
			localStorage.setItem("refreshToken", refreshToken);
		} catch {
			// localStorage unavailable (private browsing, storage disabled) — ignore
		}
	}, [accessToken, refreshToken]);

	return null;
}
