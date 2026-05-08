"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function HeroVisual() {
  const reduced = useReducedMotion();

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      style={{ minHeight: 320 }}
    >
      {/* Outer glow */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,201,167,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Main orb */}
      <motion.div
        animate={reduced ? {} : { scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 35%, rgba(0,201,167,0.25) 0%, rgba(0,229,196,0.08) 50%, transparent 70%)",
          border: "1px solid rgba(0,201,167,0.25)",
          boxShadow:
            "0 0 80px rgba(0,201,167,0.15), inset 0 0 40px rgba(0,201,167,0.05)",
          position: "relative",
          zIndex: 2,
        }}
      />

      {/* Orbital ring 1 */}
      <motion.div
        animate={reduced ? {} : { rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          border: "1px solid rgba(0,201,167,0.15)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -4,
            left: "50%",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#00C9A7",
            boxShadow: "0 0 10px #00C9A7",
            transform: "translateX(-50%)",
          }}
        />
      </motion.div>

      {/* Orbital ring 2 */}
      <motion.div
        animate={reduced ? {} : { rotate: -360 }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          width: 360,
          height: 180,
          borderRadius: "50%",
          border: "1px solid rgba(0,201,167,0.08)",
          transform: "rotateX(75deg)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -3,
            left: "25%",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#38BDF8",
            boxShadow: "0 0 8px #38BDF8",
          }}
        />
      </motion.div>

      {/* Orbital ring 3 */}
      <motion.div
        animate={reduced ? {} : { rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          width: 440,
          height: 220,
          borderRadius: "50%",
          border: "1px solid rgba(56,189,248,0.08)",
          transform: "rotateX(75deg) rotateY(30deg)",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: -3,
            right: "30%",
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#00E5C4",
            boxShadow: "0 0 6px #00E5C4",
          }}
        />
      </motion.div>

      {/* Floating stat pills */}
      {[
        { label: "🎓 Programs", x: -160, y: -80, delay: 0 },
        { label: "💰 Scholarships", x: 140, y: -60, delay: 0.5 },
        { label: "📄 Documents", x: -140, y: 80, delay: 1 },
        { label: "✈️ Visa Guide", x: 130, y: 90, delay: 1.5 },
      ].map((pill) => (
        <motion.div
          key={pill.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={
            reduced
              ? { opacity: 1 }
              : {
                  opacity: 1,
                  scale: 1,
                  y: [0, -6, 0],
                }
          }
          transition={{
            opacity: { delay: pill.delay, duration: 0.5 },
            scale: { delay: pill.delay, duration: 0.5 },
            y: {
              delay: pill.delay,
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          style={{
            position: "absolute",
            left: `calc(50% + ${pill.x}px)`,
            top: `calc(50% + ${pill.y}px)`,
            transform: "translate(-50%, -50%)",
            background: "rgba(19,26,36,0.9)",
            border: "1px solid rgba(0,201,167,0.25)",
            borderRadius: 20,
            padding: "6px 14px",
            fontSize: 12,
            color: "#E8EDF5",
            whiteSpace: "nowrap",
            backdropFilter: "blur(10px)",
            zIndex: 3,
          }}
        >
          {pill.label}
        </motion.div>
      ))}
    </div>
  );
}
