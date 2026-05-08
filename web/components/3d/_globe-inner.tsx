"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMousePosition } from "@/lib/hooks/use-mouse-position";
import { useSpring } from "framer-motion";
import * as THREE from "three";

function latLngTo3D(lat: number, lng: number, radius = 1): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

const CITY_COORDS: [number, number][] = [
  [51.5, -0.1],     // London
  [40.7, -74],      // New York
  [43.6, -79.4],    // Toronto
  [-33.9, 151.2],   // Sydney
  [52.5, 13.4],     // Berlin
  [48.9, 2.3],      // Paris
  [35.7, 139.7],    // Tokyo
  [1.3, 103.8],     // Singapore
];

function GlobeScene() {
  const groupRef = useRef<THREE.Group>(null);
  const mousePos = useMousePosition();

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.3;
    // Subtle tilt toward mouse
    groupRef.current.rotation.x += (mousePos.y * 0.15 - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.z += (-mousePos.x * 0.08 - groupRef.current.rotation.z) * 0.05;
  });

  useEffect(() => {
    const handleVisibility = () => {
      // Canvas will auto-pause when hidden via browser
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <group ref={groupRef}>
      {/* Main wireframe sphere */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#6366f1"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Atmosphere */}
      <mesh scale={1.15}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.04}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* City dots */}
      {CITY_COORDS.map(([lat, lng], i) => {
        const [x, y, z] = latLngTo3D(lat, lng, 1.02);
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
        );
      })}
    </group>
  );
}

export default function GlobeInner() {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.8], fov: 40 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
    >
      <GlobeScene />
    </Canvas>
  );
}
