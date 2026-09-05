"use client";

import { useEffect } from "react";
import { recoverFromChunkError } from "@/lib/chunk-recovery";

/**
 * Last-resort boundary. Without this file Next.js renders its own bare
 * "Application error: a client-side exception has occurred" screen for any
 * error thrown above the route-level boundaries — including a ChunkLoadError
 * from a tab left open across a deploy.
 *
 * Must render its own <html>/<body>: the root layout is what failed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (recoverFromChunkError(error)) return;
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080D18",
          color: "#E8EEF8",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
          padding: 24,
        }}
      >
        <main style={{ maxWidth: 420, textAlign: "center" }}>
          <p
            style={{
              fontSize: 13,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#4A90D9",
              margin: "0 0 12px",
            }}
          >
            EducAI
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 10px" }}>
            This page didn&apos;t load
          </h1>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "#7A8BA8",
              margin: "0 0 24px",
            }}
          >
            Something failed while starting the app. Reloading usually fixes it.
          </p>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => reset()}
              style={{
                background: "#4A90D9",
                color: "#080D18",
                border: "none",
                borderRadius: 8,
                padding: "10px 20px",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "transparent",
                color: "#E8EEF8",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 8,
                padding: "10px 20px",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Reload page
            </button>
          </div>
          {error.digest && (
            <p style={{ fontSize: 11, color: "#3D4F6B", marginTop: 20 }}>
              Reference: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
