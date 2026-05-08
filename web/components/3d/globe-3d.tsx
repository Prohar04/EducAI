"use client";

import dynamic from "next/dynamic";
import { useWebGL } from "@/lib/hooks/use-webgl";

const GlobeInner = dynamic(() => import("./_globe-inner"), { ssr: false });

function GlobeFallback() {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div
        className="relative w-48 h-48 rounded-full"
        style={{
          background: "radial-gradient(circle at 35% 35%, rgba(99,102,241,0.15), rgba(99,102,241,0.03))",
          border: "1px solid rgba(99,102,241,0.3)",
          boxShadow: "0 0 60px rgba(99,102,241,0.1)",
        }}
      >
        {/* Orbital ring */}
        <div
          className="absolute inset-[-20px] rounded-full"
          style={{
            border: "1px solid rgba(99,102,241,0.2)",
            transform: "rotateX(70deg)",
          }}
        />
        {/* Dots representing cities */}
        {[
          { top: "20%", left: "30%" },
          { top: "40%", left: "70%" },
          { top: "60%", left: "25%" },
          { top: "30%", left: "60%" },
          { top: "70%", left: "55%" },
          { top: "50%", left: "45%" },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-emerald-400/80"
            style={{
              top: pos.top,
              left: pos.left,
              boxShadow: "0 0 6px rgba(16,185,129,0.8)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface Globe3DProps {
  className?: string;
}

export function Globe3D({ className }: Globe3DProps) {
  const { supported } = useWebGL();

  return (
    <div className={className ?? "w-full h-full"}>
      {supported ? <GlobeInner /> : <GlobeFallback />}
    </div>
  );
}
