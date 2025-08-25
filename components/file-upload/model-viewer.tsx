import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

/**
 * Tiny 50x50 card that renders a GLTF/GLB model and auto-rotates it.
 * - Non-interactive (no orbit/drag). Pointer events are disabled.
 * - Give it any .glb/.gltf src via props.
 * - Keeps things lightweight for such a tiny viewport.
 */
export default function TinyModelCard({
  src,
  speed = 0.8, // radians per second
  className = "",
}: Readonly<{
  src: string;
  speed?: number;
  className?: string;
}>) {
  return (
    <div
      className={cn(
        "w-[50px] h-[50px] rounded-2xl border bg-background shadow-sm overflow-hidden pointer-events-none",
        className
      )}
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 25 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        {/* Simple lighting good enough for a tiny preview */}
        <ambientLight intensity={1} />
        <directionalLight position={[2, 3, 4]} intensity={1.2} />

        <AutoRotatingModel src={src} speed={speed} />
      </Canvas>
    </div>
  );
}

function AutoRotatingModel({ src, speed }: { src: string; speed: number }) {
  const group = useRef<THREE.Group>(null!);
  const { scene } = useGLTF(src);

  // Rotate smoothly at the given radians-per-second speed
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += speed * delta;
  });

  return (
    <group ref={group}>
      {/* Center automatically recenters and (optionally) scales content to its bounds */}
      <Center>
        {/* Render the loaded GLTF scene */}
        <primitive object={scene} />
      </Center>
    </group>
  );
}

// Optionally: if you know your model path in advance you can preload it
// useGLTF.preload("/models/your-model.glb");
