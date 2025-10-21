"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, Html } from "@react-three/drei";
import type { KatanaConfiguration } from "@/lib/validation";
import { DEFAULT_BACKGROUND_COLOR } from "@/lib/background";
import KatanaScene from "./KatanaScene";

type KatanaCanvasProps = {
  config: KatanaConfiguration;
  backgroundColor?: string;
};

function LoadingOverlay() {
  return (
    <Html center>
      <div className="rounded-full border border-white/20 bg-black/70 px-6 py-3 text-xs uppercase tracking-[0.4em] text-white/70 backdrop-blur">
        Chargement du modèle...
      </div>
    </Html>
  );
}

export default function KatanaCanvas({
  config,
  backgroundColor = DEFAULT_BACKGROUND_COLOR,
}: KatanaCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
    };
  }, []);

  const requestFullscreen = useCallback(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const requestMethod =
      element.requestFullscreen?.bind(element) ||
      (element as any).webkitRequestFullscreen?.bind(element) ||
      (element as any).mozRequestFullScreen?.bind(element) ||
      (element as any).msRequestFullscreen?.bind(element);

    if (requestMethod) {
      void requestMethod();
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    const exitMethod =
      document.exitFullscreen?.bind(document) ||
      (document as any).webkitExitFullscreen?.bind(document) ||
      (document as any).mozCancelFullScreen?.bind(document) ||
      (document as any).msExitFullscreen?.bind(document);

    if (exitMethod) {
      void exitMethod();
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      requestFullscreen();
    }
  }, [exitFullscreen, isFullscreen, requestFullscreen]);

  return (
    <div ref={containerRef} className="relative h-full w-full rounded-3xl bg-black/60">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [3.5, 2, 5], fov: 45 }}
        className="h-full w-full rounded-3xl"
      >
        <color attach="background" args={[backgroundColor]} />
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
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end p-4">
        <button
          type="button"
          onClick={toggleFullscreen}
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[0.7rem] uppercase tracking-[0.3em] text-white/70 transition hover:border-emberGold hover:text-emberGold focus-visible:outline focus-visible:outline-2 focus-visible:outline-emberGold focus-visible:outline-offset-2"
          aria-pressed={isFullscreen}
        >
          {isFullscreen ? "Quitter plein ecran" : "Plein ecran"}
        </button>
      </div>
    </div>
  );
}
