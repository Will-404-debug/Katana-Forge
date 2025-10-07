"use client";

import { useEffect, useMemo } from "react";
import { Box3, Color, Material, Mesh, MeshStandardMaterial, Object3D, Vector3 } from "three";
import { useGLTF } from "@react-three/drei";
import type { KatanaConfiguration } from "@/lib/validation";

type KatanaSceneProps = {
  config: KatanaConfiguration;
};

type KatanaPart = "handle" | "guard" | "blade";

function applyToMaterial(
  material: Material | Material[] | null | undefined,
  updater: (target: MeshStandardMaterial) => void,
) {
  if (!material) return;
  if (Array.isArray(material)) {
    material.forEach((item) => {
      if (item instanceof MeshStandardMaterial) {
        updater(item);
      }
    });
    return;
  }
  if (material instanceof MeshStandardMaterial) {
    updater(material);
  }
}

export default function KatanaScene({ config }: KatanaSceneProps) {
  const gltf = useGLTF("/models/katana.glb");

  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useEffect(() => {
    const createdMaterials: Material[] = [];
    const initialBox = new Box3().setFromObject(scene);
    const initialSize = new Vector3();
    initialBox.getSize(initialSize);
    const maxAxis = Math.max(initialSize.x, initialSize.y, initialSize.z) || 1;
    const target = 2.2;
    scene.scale.setScalar(target / maxAxis);

    const box = new Box3().setFromObject(scene);
    const center = new Vector3();
    box.getCenter(center);
    scene.position.sub(center);

    scene.updateMatrixWorld(true);

    scene.traverse((node: Object3D) => {
      if ((node as Mesh).isMesh) {
        const mesh = node as Mesh;
        const current = mesh.material;
        mesh.geometry?.computeBoundingBox();
        const boundingBox = mesh.geometry?.boundingBox;

        if (boundingBox) {
          const size = new Vector3();
          const center = new Vector3();
          boundingBox.getSize(size);
          boundingBox.getCenter(center);

          let part: KatanaPart = "blade";

          if (size.y > 0.8) {
            part = "blade";
          } else if (center.y < -0.2) {
            if (size.y < 0.2 && size.x < 0.3 && size.z < 0.3) {
              part = "guard";
            } else {
              part = "handle";
            }
          }

          mesh.userData.katanaPart = part;
        }

        if (Array.isArray(current)) {
          mesh.material = current.map((item) => {
            const clone = item.clone();
            createdMaterials.push(clone);
            return clone;
          });
        } else if (current) {
          const clone = current.clone();
          mesh.material = clone;
          createdMaterials.push(clone);
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    return () => {
      createdMaterials.forEach((mat) => mat.dispose());
    };
  }, [scene]);

  useEffect(() => {
    const bladeColor = new Color(config.bladeTint);
    const tsukaColor = new Color(config.handleColor);

    scene.traverse((node: Object3D) => {
      if ((node as Mesh).isMesh) {
        const mesh = node as Mesh;
        const part: KatanaPart = mesh.userData.katanaPart ?? "blade";
        const colorTarget = part === "handle" || part === "guard" ? tsukaColor : bladeColor;
        const metalness =
          part === "handle"
            ? Math.min(0.4 + config.metalness * 0.2, 0.6)
            : part === "guard"
              ? Math.min(0.6 + config.metalness * 0.4, 0.9)
              : config.metalness;
        const roughness =
          part === "handle"
            ? Math.min(config.roughness + 0.25, 0.95)
            : part === "guard"
              ? Math.max(config.roughness - 0.1, 0.1)
              : config.roughness;

        applyToMaterial(mesh.material, (mat) => {
          mat.color.copy(colorTarget);
          mat.metalness = metalness;
          mat.roughness = roughness;
          mat.needsUpdate = true;
        });
      }
    });
  }, [scene, config.handleColor, config.bladeTint, config.metalness, config.roughness]);

  return <primitive object={scene} position={[0, -0.5, 0]} dispose={null} />;
}

useGLTF.preload("/models/katana.glb");
