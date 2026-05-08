"use client";

import { useState, useEffect, useRef } from "react";

export function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const lastUpdate = useRef(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastUpdate.current < 16) return; // ~60fps throttle
      lastUpdate.current = now;

      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      setPosition({ x, y });
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return position;
}
