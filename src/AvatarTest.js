import React, { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function AvatarDebugger() {
  const { scene } = useGLTF("/avatar.glb");
  const meshRef = useRef();

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.morphTargetDictionary) {
        console.log("Morph targets:", child.morphTargetDictionary);
        meshRef.current = child;
      }
    });
  }, [scene]);

  // simple test: oscillate first morph target
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const influences = meshRef.current.morphTargetInfluences;
      if (influences.length > 0) {
        influences[0] = (Math.sin(clock.elapsedTime * 4) + 1) / 2;
      }
    }
  });

  return <primitive object={scene} scale={2.5} position={[0, -1.5, 0]} />;
}

export default function AvatarTest() {
  return (
    <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
      <ambientLight />
      <directionalLight position={[3, 3, 3]} intensity={1.5} />
      <AvatarDebugger />
      <OrbitControls />
    </Canvas>
  );
}
