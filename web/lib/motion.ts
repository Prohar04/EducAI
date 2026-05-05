/**
 * Shared motion tokens and variants for EducAI.
 * Use these instead of inline values to keep motion consistent.
 */

// Easing curves
export const ease = {
  /** Entrance: fast-out feels purposeful */
  out: [0.22, 1, 0.36, 1] as [number, number, number, number],
  /** State changes: balanced in-out */
  inOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  /** Slight overshoot spring feel for UI pops */
  spring: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
} as const;

// Duration tokens (seconds)
export const duration = {
  micro: 0.12,
  fast: 0.18,
  normal: 0.28,
  relaxed: 0.4,
  slow: 0.5,
} as const;

// Reusable motion variants
export const variants = {
  fadeIn: {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: duration.relaxed, ease: ease.out } },
  },

  fadeInFast: {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: duration.fast, ease: ease.out } },
  },

  scaleIn: {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1, transition: { duration: duration.normal, ease: ease.spring } },
  },

  slideInRight: {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0, transition: { duration: duration.normal, ease: ease.out } },
    exit:   { opacity: 0, x: -16, transition: { duration: duration.fast, ease: ease.inOut } },
  },

  slideInLeft: {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0, transition: { duration: duration.normal, ease: ease.out } },
    exit:   { opacity: 0, x: 16, transition: { duration: duration.fast, ease: ease.inOut } },
  },

  staggerContainer: (stagger = 0.07) => ({
    hidden: {},
    visible: { transition: { staggerChildren: stagger } },
  }),

  staggerItem: {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: duration.relaxed, ease: ease.out } },
  },

  panelOpen: {
    hidden: { opacity: 0, scale: 0.93, y: 12 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: duration.normal, ease: ease.spring } },
    exit:   { opacity: 0, scale: 0.95, y: 8, transition: { duration: duration.fast, ease: ease.inOut } },
  },

  messageBubble: {
    hidden: { opacity: 0, y: 8, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: duration.fast, ease: ease.out } },
  },
} as const;
