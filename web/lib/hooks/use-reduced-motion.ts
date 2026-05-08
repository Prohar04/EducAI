"use client";

import { useReducedMotion } from "framer-motion";

export function useReducedMotionPreference(): boolean {
  const reduced = useReducedMotion();
  return !!reduced;
}
