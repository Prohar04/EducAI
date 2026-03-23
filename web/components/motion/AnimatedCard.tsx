"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

type AnimatedCardProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

/**
 * Card with subtle hover animation - tiny lift and border brighten.
 * Respects prefers-reduced-motion.
 */
export function AnimatedCard({ children, className = "", onClick }: AnimatedCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={reduced ? undefined : { y: -2 }}
      transition={reduced ? undefined : { duration: 0.2 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

/**
 * Button with press animation - scales down on tap.
 */
export function AnimatedButton({ children, className = "", ...props }: React.ComponentProps<typeof motion.button>) {
  const reduced = useReducedMotion();

  return (
    <motion.button
      className={className}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.1 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
