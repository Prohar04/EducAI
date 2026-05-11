"use client";

import { useEffect, useState } from "react";

export function NoiseTexture() {
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Skip procedural noise on mobile/coarse-pointer/reduced-motion devices
    // to avoid extra GPU work during scroll.
    const mq = window.matchMedia(
      "(max-width: 1023px), (pointer: coarse), (prefers-reduced-motion: reduce)"
    );

    const updateEnabled = () => setEnabled(!mq.matches);
    updateEnabled();
    mq.addEventListener("change", updateEnabled);

    return () => mq.removeEventListener("change", updateEnabled);
  }, [mounted]);

  if (!mounted || !enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{
        opacity: 0.02,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "128px 128px",
        contain: "paint",
        transform: "translateZ(0)",
      }}
    />
  );
}
