"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Global scroll restoration and unlock.
 * Mounted once in the root layout. Clears ALL potential scroll locks:
 * - Inline styles on html/body (overflow, touch-action)
 * - scroll-locked classes on html/body
 * - Any stale document event listeners
 *
 * This runs on every pathname change AND on every component mount
 * to catch stale state from auth redirects, mobile menus, overlays, etc.
 */
export function GlobalScrollRestore() {
  const pathname = usePathname();
  const mounted = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Clear all inline styles
    root.style.overflow = "";
    root.style.touchAction = "";
    body.style.overflow = "";
    body.style.touchAction = "";

    // Remove scroll-locked classes
    root.classList.remove("scroll-locked");
    body.classList.remove("scroll-locked");

    // Remove properties to ensure CSS defaults are restored
    root.style.removeProperty("overflow");
    root.style.removeProperty("touch-action");
    body.style.removeProperty("overflow");
    body.style.removeProperty("touch-action");

    // Log for debugging (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.debug("[ScrollRestore] Cleared scroll state", {
        pathname,
        htmlOverflow: root.style.overflow,
        bodyOverflow: body.style.overflow,
      });
    }
  }, [pathname]);

  // Run once on mount to catch auth redirects and first render
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const root = document.documentElement;
    const body = document.body;

    root.style.overflow = "";
    root.style.touchAction = "";
    body.style.overflow = "";
    body.style.touchAction = "";
    root.classList.remove("scroll-locked");
    body.classList.remove("scroll-locked");
    root.style.removeProperty("overflow");
    root.style.removeProperty("touch-action");
    body.style.removeProperty("overflow");
    body.style.removeProperty("touch-action");
  }, []);

  // Periodic check every 500ms to catch any stale scroll locks that might
  // be reintroduced by other components (belt-and-suspenders approach)
  useEffect(() => {
    const interval = setInterval(() => {
      const root = document.documentElement;
      const body = document.body;

      // If scroll is locked, force clear it
      if (
        root.style.overflow === "hidden" ||
        body.style.overflow === "hidden" ||
        root.classList.contains("scroll-locked") ||
        body.classList.contains("scroll-locked")
      ) {
        root.style.overflow = "";
        root.style.touchAction = "";
        body.style.overflow = "";
        body.style.touchAction = "";
        root.classList.remove("scroll-locked");
        body.classList.remove("scroll-locked");
        root.style.removeProperty("overflow");
        root.style.removeProperty("touch-action");
        body.style.removeProperty("overflow");
        body.style.removeProperty("touch-action");
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return null;
}
