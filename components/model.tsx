"use client";

import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { useRef, useState, useLayoutEffect, Suspense } from "react";
import * as THREE from "three";

function Model({
  url,
  minHeight = 1.5,
  maxHeight = 1.5,
}: Readonly<{
  url: string;
  minHeight?: number;
  maxHeight?: number;
}>) {
  const { scene } = useGLTF(url);
  const group = useRef<THREE.Group>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    if (group.current) {
      const box = new THREE.Box3().setFromObject(group.current);
      const size = new THREE.Vector3();
      box.getSize(size);
      const height = size.y;
      let newScale = 1;

      if (height < minHeight) {
        newScale = minHeight / height;
      } else if (height > maxHeight) {
        newScale = maxHeight / height;
      }

      setScale(newScale);
    }
  }, [scene, minHeight, maxHeight]);

  return (
    <group ref={group} scale={[scale, scale, scale]}>
      <primitive object={scene} />
    </group>
  );
}

export default function Scene({
  modelUrl,
  height = 400,
}: Readonly<{
  modelUrl: string;
  height?: number;
}>) {
  return (
    <div style={{ position: "relative", width: "50%", height }} className="relative left-1/2 -translate-x-1/2">
      <Canvas
        camera={{ position: [0, 1, 3], fov: 50 }}
        style={{ height: "100%" }}
        className="relative left-1/2 -translate-x-1/2"
        onCreated={({ gl }) => {
          return () => {
            gl.dispose();
            const ext = gl.getContext().getExtension("WEBGL_lose_context");
            ext?.loseContext();
          };
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        <Suspense fallback={null}>
          <Model url={modelUrl} />
        </Suspense>

        <OrbitControls minDistance={2} maxDistance={6} />
      </Canvas>
    </div>
  );
}
