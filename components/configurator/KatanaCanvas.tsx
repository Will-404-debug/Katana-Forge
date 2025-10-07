"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, Html } from "@react-three/drei";
import type { KatanaConfiguration } from "@/lib/validation";
import KatanaScene from "./KatanaScene";

type KatanaCanvasProps = {
  config: KatanaConfiguration;
};

function LoadingOverlay() {
  return (
    <Html center>
      <div className="rounded-full border border-white/20 bg-black/70 px-6 py-3 text-xs uppercase tracking-[0.4em] text-white/70 backdrop-blur">
        Chargement du modele...
      </div>
    </Html>
  );
}

export default function KatanaCanvas({ config }: KatanaCanvasProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [3.5, 2, 5], fov: 45 }}
      className="h-full w-full"
    >
      <color attach="background" args={["#040405"]} />
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[5, 6, 2]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Suspense fallback={<LoadingOverlay />}>
        <KatanaScene config={config} />
        <Environment preset="dawn" background={false} />
        <ContactShadows
          position={[0, -0.8, 0]}
          opacity={0.6}
          scale={12}
          blur={2.2}
          far={4.5}
        />
      </Suspense>
      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={2.2} maxDistance={7.5} />
    </Canvas>
  );
}
