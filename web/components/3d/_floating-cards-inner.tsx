"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import { useMousePosition } from "@/lib/hooks/use-mouse-position";
import * as THREE from "three";

interface CardConfig {
  label: string;
  position: [number, number, number];
  rotation: [number, number, number];
  phaseOffset: number;
}

const CARDS: CardConfig[] = [
  { label: "SOP", position: [-1.2, 0.8, 0], rotation: [0.1, -0.3, 0.05], phaseOffset: 0 },
  { label: "CV", position: [1.1, 0.2, -0.5], rotation: [-0.05, 0.4, -0.08], phaseOffset: 1.5 },
  { label: "Scholarship", position: [-0.3, -0.9, -0.3], rotation: [0.08, -0.1, 0.12], phaseOffset: 3 },
  { label: "Visa", position: [1.3, -0.5, 0.2], rotation: [-0.1, 0.2, -0.05], phaseOffset: 4.5 },
];

function Card({ config }: { config: CardConfig }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const baseY = config.position[1];

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.position.y = baseY + Math.sin(clock.elapsedTime + config.phaseOffset) * 0.12;
  });

  return (
    <mesh ref={meshRef} position={config.position} rotation={config.rotation}>
      <RoundedBox args={[1.2, 0.5, 0.06]} radius={0.08} smoothness={4}>
        <meshStandardMaterial
          color="#1c1c27"
          metalness={0.3}
          roughness={0.7}
          emissive="#6366f1"
          emissiveIntensity={0.05}
        />
      </RoundedBox>
      <Text
        position={[0, 0, 0.04]}
        fontSize={0.14}
        color="#9090b0"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {config.label}
      </Text>
    </mesh>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useMousePosition();

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += (mouse.x * 0.15 - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x += (-mouse.y * 0.1 - groupRef.current.rotation.x) * 0.05;
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.6} />
      <pointLight position={[2, 3, 4]} intensity={0.8} />
      {CARDS.map((card) => (
        <Card key={card.label} config={card} />
      ))}
    </group>
  );
}

export default function FloatingCardsInner() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene />
    </Canvas>
  );
}
