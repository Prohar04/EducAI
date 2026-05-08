"use client";

import dynamic from "next/dynamic";
import { useWebGL } from "@/lib/hooks/use-webgl";

const ParticleFieldInner = dynamic(() => import("./_particle-field-inner"), { ssr: false });

function ParticleFieldFallback() {
  return (
    <div
      className="w-full h-full"
      style={{
        background:
          "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)",
      }}
    />
  );
}

interface ParticleFieldProps {
  className?: string;
}

export function ParticleField({ className }: ParticleFieldProps) {
  const { supported } = useWebGL();

  return (
    <div className={className ?? "w-full h-full"}>
      {supported ? <ParticleFieldInner /> : <ParticleFieldFallback />}
    </div>
  );
}
