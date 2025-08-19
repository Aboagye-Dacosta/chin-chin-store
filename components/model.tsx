import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";
import { useId } from "react";

/**
 * A 100x100 card that renders a GLTF/GLB model and auto-rotates it.
 * - Non-interactive (no orbit/drag). Pointer events are disabled.
 * - Give it any .glb/.gltf src via props.
 */
export default function LargeModelCard({
  src,
  speed = 0.8, // radians per second
  className = "",
}: Readonly<{
  src: string;
  speed?: number;
  className?: string;
}>) {
  const { scene } = useGLTF(src);
  const id = useId();

  return (
    <div
      className={`w-[300px] h-[300px] rounded-2xl overflow-hidden -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 relative pointer-events-none ${className}`}
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 25 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
        key={id}
      >
        {/* Simple lighting */}
        <ambientLight intensity={1} />
        <directionalLight position={[2, 3, 4]} intensity={1.2} />

        <AutoRotatingModel key={id} scene={scene} speed={speed} />
      </Canvas>
    </div>
  );
}

function AutoRotatingModel({
  scene,
  speed,
}: {
  scene: THREE.Group;
  speed: number;
}) {
  const group = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += speed * delta;
  });

  return (
    <group ref={group}>
      <Center>
        <primitive object={scene.clone()} />
      </Center>
    </group>
  );
}

// Optionally: preload a model
// useGLTF.preload("/models/your-model.glb")