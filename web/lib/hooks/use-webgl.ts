"use client";

import { useState } from "react";

export function useWebGL() {
  const [supported] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      return !!gl;
    } catch {
      return false;
    }
  });

  return { supported };
}
