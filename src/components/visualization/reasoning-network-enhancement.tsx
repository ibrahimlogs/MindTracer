"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ComponentType } from "react";

function detectWebGLSupport() {
  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
}

export function ReasoningNetworkEnhancement() {
  const layer = useRef<HTMLDivElement>(null);
  const inView = useInView(layer, { amount: 0.15 });
  const reducedMotion = useReducedMotion();
  const [pageVisible, setPageVisible] = useState(true);
  const [webglSupported, setWebglSupported] = useState(false);
  const [CanvasComponent, setCanvasComponent] = useState<ComponentType<{
    active: boolean;
  }> | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const desktopCanvas = window.matchMedia("(min-width: 768px)").matches;
      setWebglSupported(desktopCanvas && detectWebGLSupport());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleVisibility = () =>
      setPageVisible(document.visibilityState === "visible");
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (
      reducedMotion !== false ||
      !webglSupported ||
      !inView ||
      CanvasComponent
    )
      return;

    let cancelled = false;
    void import("@/components/visualization/reasoning-canvas").then(
      (module) => {
        if (!cancelled) setCanvasComponent(() => module.ReasoningCanvas);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [CanvasComponent, inView, reducedMotion, webglSupported]);

  return (
    <div
      ref={layer}
      className="pointer-events-none absolute inset-0 z-10"
      aria-hidden="true"
    >
      {CanvasComponent ? (
        <div className="absolute inset-0 bg-surface-inset">
          <CanvasComponent active={inView && pageVisible} />
        </div>
      ) : null}
    </div>
  );
}
