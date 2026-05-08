"use client";

import dynamic from "next/dynamic";
import { useWebGL } from "@/lib/hooks/use-webgl";
import { motion } from "framer-motion";

const FloatingCardsInner = dynamic(() => import("./_floating-cards-inner"), { ssr: false });

function FloatingCardsFallback() {
  const cards = [
    { label: "SOP", deg: "-8deg", x: "-20px", y: "-30px", delay: 0 },
    { label: "CV", deg: "6deg", x: "30px", y: "-10px", delay: 0.15 },
    { label: "Scholarship", deg: "-4deg", x: "-10px", y: "40px", delay: 0.3 },
    { label: "Visa", deg: "10deg", x: "40px", y: "30px", delay: 0.45 },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {cards.map((card) => (
        <motion.div
          key={card.label}
          className="absolute rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-xl px-5 py-3 text-sm font-semibold text-foreground/80"
          style={{ rotate: card.deg, x: card.x, y: card.y }}
          animate={{ y: [card.y, `calc(${card.y} - 10px)`, card.y] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: card.delay,
          }}
        >
          {card.label}
        </motion.div>
      ))}
    </div>
  );
}

interface FloatingCards3DProps {
  className?: string;
}

export function FloatingCards3D({ className }: FloatingCards3DProps) {
  const { supported } = useWebGL();

  return (
    <div className={className ?? "w-full h-full"}>
      {supported ? <FloatingCardsInner /> : <FloatingCardsFallback />}
    </div>
  );
}
