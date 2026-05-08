"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 250;
const BOUNDS = 5;
const CONNECTION_DIST = 1.5;
const MAX_LINES = 150;

function Particles() {
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // eslint-disable-next-line react-hooks/purity
  const particles = useMemo(() => {
    /* eslint-disable react-hooks/purity */
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      x: (Math.random() - 0.5) * BOUNDS * 2,
      y: (Math.random() - 0.5) * BOUNDS * 2,
      z: (Math.random() - 0.5) * BOUNDS * 2,
      vx: (Math.random() - 0.5) * 0.008,
      vy: (Math.random() - 0.5) * 0.008,
      vz: (Math.random() - 0.5) * 0.004,
    }));
    /* eslint-enable react-hooks/purity */
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      // handled via requestAnimationFrame pause in browser
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useFrame(() => {
    if (!instancedRef.current) return;

    /* eslint-disable react-hooks/immutability */
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      if (p.x > BOUNDS) p.x = -BOUNDS;
      if (p.x < -BOUNDS) p.x = BOUNDS;
      if (p.y > BOUNDS) p.y = -BOUNDS;
      if (p.y < -BOUNDS) p.y = BOUNDS;
      if (p.z > BOUNDS) p.z = -BOUNDS;
      if (p.z < -BOUNDS) p.z = BOUNDS;
    /* eslint-enable react-hooks/immutability */

      dummy.position.set(p.x, p.y, p.z);
      dummy.updateMatrix();
      instancedRef.current.setMatrixAt(i, dummy.matrix);
    }
    instancedRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={instancedRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[0.025, 6, 6]} />
      <meshBasicMaterial color="#6366f1" transparent opacity={0.4} />
    </instancedMesh>
  );
}

function ConnectionLines() {
  const linesRef = useRef<THREE.LineSegments>(null);
  const posArr = useMemo(() => new Float32Array(MAX_LINES * 2 * 3), []);

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[posArr, 3]}
          count={MAX_LINES * 2}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#6366f1" transparent opacity={0.12} />
    </lineSegments>
  );
}

export default function ParticleFieldInner() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ background: "transparent" }}
      gl={{ antialias: false, alpha: true }}
    >
      <Particles />
      <ConnectionLines />
    </Canvas>
  );
}
