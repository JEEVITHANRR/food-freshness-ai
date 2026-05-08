"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, PerspectiveCamera, Environment } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function FloatingObject({ position, color, speed, distort }: { position: [number, number, number], color: string, speed: number, distort: number }) {
  const mesh = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    mesh.current.rotation.x = Math.sin(time * speed) * 0.2;
    mesh.current.rotation.y = Math.cos(time * speed) * 0.2;
  });

  return (
    <Float speed={speed} rotationIntensity={1.5} floatIntensity={2}>
      <Sphere ref={mesh} position={position} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color={color}
          speed={speed}
          distort={distort}
          radius={1}
          metalness={0.5}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </Sphere>
    </Float>
  );
}

export default function FoodScene() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#10b981" />
        
        <FloatingObject position={[-4, 2, 0]} color="#10b981" speed={1.5} distort={0.4} />
        <FloatingObject position={[5, -1, -2]} color="#059669" speed={1.2} distort={0.3} />
        <FloatingObject position={[-2, -3, -4]} color="#34d399" speed={1.8} distort={0.5} />
        
        <Environment preset="city" />
        
        <gridHelper args={[20, 20, 0x10b981, 0x10b981]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -10]} />
      </Canvas>
    </div>
  );
}
