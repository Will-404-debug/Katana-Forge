"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Points, PointMaterial } from "@react-three/drei";
import type { Points as PointsType } from "three";

const PARTICLE_COUNT = 600;

function EmberField() {
  const pointsRef = useRef<PointsType>(null);

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const index = i * 3;
      pos[index] = (Math.random() - 0.5) * 6; // x
      pos[index + 1] = Math.random() * -4; // y
      pos[index + 2] = (Math.random() - 0.5) * 2; // z
      vel[i] = 0.005 + Math.random() * 0.01;
    }

    return { positions: pos, speeds: vel };
  }, []);

  useFrame(() => {
    const points = pointsRef.current;
    if (!points) return;

    const array = points.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const index = i * 3;
      array[index + 1] += speeds[i];

      if (array[index + 1] > 2) {
        array[index] = (Math.random() - 0.5) * 6;
        array[index + 1] = Math.random() * -4;
        array[index + 2] = (Math.random() - 0.5) * 2;
      }
    }

    points.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial transparent color="#ff9962" size={0.05} sizeAttenuation depthWrite={false} />
    </Points>
  );
}

export default function HeroParticles() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ alpha: true }}
      className="pointer-events-none"
    >
      <EmberField />
    </Canvas>
  );
}
