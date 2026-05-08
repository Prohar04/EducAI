"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

export function NavProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [pathname]);

  if (reduced) return null;

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="nav-progress"
          className="fixed top-0 left-0 right-0 z-[9999] h-[2px]"
          style={{
            background: "linear-gradient(90deg, #00C9A7, #38BDF8)",
          }}
          initial={{ scaleX: 0, transformOrigin: "left" }}
          animate={{ scaleX: 0.9, transformOrigin: "left" }}
          exit={{ scaleX: 1, opacity: 0, transformOrigin: "left" }}
          transition={{
            scaleX: { duration: 0.5, ease: "easeOut" },
            opacity: { duration: 0.2, delay: 0.1 },
          }}
        />
      )}
    </AnimatePresence>
  );
}
