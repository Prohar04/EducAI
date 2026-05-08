"use client";

import { useEffect, useState } from "react";

export function useWebGL() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSupported(!!gl);
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSupported(false);
    }
  }, []);

  return { supported };
}
