"use client";

import { useMotionValue } from "framer-motion";
import { useRef, useEffect, useEffectEvent } from "react";
import { useUIStore } from "@/store/ui-store";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3.0;

export function useCamera() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const savedCamera = useUIStore((state) => state.camera);

  // Initialize from persisted camera state
  const cameraX = useMotionValue(savedCamera.x);
  const cameraY = useMotionValue(savedCamera.y);
  const zoom = useMotionValue(savedCamera.zoom);

  const setCameraStore = useUIStore((state) => state.setCamera);
  const currentTool = useUIStore((state) => state.currentTool);

  const isPanning = useRef(false);
  const startPointer = useRef({ x: 0, y: 0 });
  const startCamera = useRef({ x: 0, y: 0 });

  const syncStore = () => {
    setCameraStore({
      x: cameraX.get(),
      y: cameraY.get(),
      zoom: zoom.get(),
    });
  };

  const zoomToCursor = (clientX: number, clientY: number, delta: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = clientX - rect.left;
    const cursorY = clientY - rect.top;

    const currentZoom = zoom.get();
    const currentX = cameraX.get();
    const currentY = cameraY.get();

    const worldX = (cursorX - currentX) / currentZoom;
    const worldY = (cursorY - currentY) / currentZoom;

    const factor = delta < 0 ? 1.08 : 1 / 1.08;
    const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom * factor));

    const nextX = cursorX - worldX * nextZoom;
    const nextY = cursorY - worldY * nextZoom;

    cameraX.set(nextX);
    cameraY.set(nextY);
    zoom.set(nextZoom);

    syncStore();
  };

  const handleWheelEvent = useEffectEvent((e: WheelEvent) => {
    e.preventDefault();
    zoomToCursor(e.clientX, e.clientY, e.deltaY);
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("wheel", handleWheelEvent, { passive: false });
    return () => container.removeEventListener("wheel", handleWheelEvent);
  }, [containerRef]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const isMiddleClick = e.button === 1;
    const isPanTool = currentTool === "pan";
    const isSpaceHeld = e.shiftKey;

    if (!isPanTool && !isMiddleClick && !isSpaceHeld && e.button !== 0) return;

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    isPanning.current = true;
    startPointer.current = { x: e.clientX, y: e.clientY };
    startCamera.current = { x: cameraX.get(), y: cameraY.get() };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning.current) return;

    const dx = e.clientX - startPointer.current.x;
    const dy = e.clientY - startPointer.current.y;

    cameraX.set(startCamera.current.x + dx);
    cameraY.set(startCamera.current.y + dy);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPanning.current) return;
    isPanning.current = false;
    const target = e.currentTarget as HTMLElement;
    target.releasePointerCapture(e.pointerId);
    syncStore();
  };

  const resetCamera = () => {
    cameraX.set(0);
    cameraY.set(0);
    zoom.set(1);
    syncStore();
  };

  const fitToScreen = (assetBounds: { x: number; y: number; width: number; height: number }[]) => {
    if (assetBounds.length === 0 || !containerRef.current) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    assetBounds.forEach((b) => {
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.width);
      maxY = Math.max(maxY, b.y + b.height);
    });

    const rect = containerRef.current.getBoundingClientRect();
    const margin = 50;
    const contentW = maxX - minX;
    const contentH = maxY - minY;

    const scaleX = (rect.width - margin * 2) / contentW;
    const scaleY = (rect.height - margin * 2) / contentH;
    const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(scaleX, scaleY)));

    const nextX = rect.width / 2 - (minX + contentW / 2) * nextZoom;
    const nextY = rect.height / 2 - (minY + contentH / 2) * nextZoom;

    cameraX.set(nextX);
    cameraY.set(nextY);
    zoom.set(nextZoom);
    syncStore();
  };

  return {
    containerRef,
    cameraX,
    cameraY,
    zoom,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    resetCamera,
    fitToScreen,
  };
}
