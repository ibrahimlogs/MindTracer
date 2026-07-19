"use client";

import { Line } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";

type Point = [number, number, number];

interface AnimatedNodeProps {
  position: Point;
  color: string;
  delay: number;
  size?: number;
}

function AnimatedNode({
  position,
  color,
  delay,
  size = 0.12,
}: AnimatedNodeProps) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 1.7 - delay) * 0.08;
    mesh.current.scale.setScalar(pulse);
  });

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[size, 20, 20]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

interface ReasoningCanvasProps {
  active: boolean;
}

function Scene() {
  const styles = getComputedStyle(document.documentElement);
  const reasoning = styles.getPropertyValue("--reasoning").trim();
  const attention = styles.getPropertyValue("--attention").trim();
  const success = styles.getPropertyValue("--success").trim();
  const muted = styles.getPropertyValue("--text-muted").trim();

  const input: Point = [-2.35, 0.45, 0];
  const center: Point = [-1.15, 0.45, 0];
  const branchA: Point = [0.05, 1.05, 0];
  const branchB: Point = [0.05, -0.15, 0];
  const verify: Point = [1.15, -0.15, 0];
  const intervene: Point = [2.1, 0.25, 0];
  const transfer: Point = [2.85, 0.85, 0];

  const lines: Array<{ points: Point[]; color: string; opacity: number }> = [
    { points: [input, center], color: muted, opacity: 0.7 },
    { points: [center, branchA], color: attention, opacity: 0.45 },
    { points: [center, branchB], color: attention, opacity: 0.8 },
    { points: [branchA, verify], color: muted, opacity: 0.28 },
    { points: [branchB, verify], color: reasoning, opacity: 0.9 },
    { points: [verify, intervene], color: reasoning, opacity: 0.9 },
    { points: [intervene, transfer], color: success, opacity: 0.9 },
  ];

  return (
    <>
      {lines.map((line, index) => (
        <Line
          key={index}
          points={line.points}
          color={line.color}
          lineWidth={1.2}
          transparent
          opacity={line.opacity}
        />
      ))}
      <AnimatedNode position={input} color={muted} delay={0} />
      <AnimatedNode
        position={center}
        color={reasoning}
        delay={0.5}
        size={0.17}
      />
      <AnimatedNode position={branchA} color={attention} delay={1} />
      <AnimatedNode position={branchB} color={attention} delay={1.2} />
      <AnimatedNode
        position={verify}
        color={reasoning}
        delay={1.8}
        size={0.15}
      />
      <AnimatedNode
        position={intervene}
        color={success}
        delay={2.4}
        size={0.14}
      />
      <AnimatedNode position={transfer} color={success} delay={3} size={0.19} />
    </>
  );
}

export function ReasoningCanvas({ active }: ReasoningCanvasProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0.2, 0.4, 8], zoom: 82 }}
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      aria-hidden="true"
    >
      <Scene />
    </Canvas>
  );
}
