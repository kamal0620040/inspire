"use client";

import { useMotionValue, useMotionValueEvent } from "framer-motion";
import { useRef, useCallback } from "react";
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

  // Sync state back to Zustand store for toolbar zoom percentage indicator
  const setCameraStore = useUIStore((state) => state.setCamera);
  const currentTool = useUIStore((state) => state.currentTool);

  const isPanning = useRef(false);
  const startPointer = useRef({ x: 0, y: 0 });
  const startCamera = useRef({ x: 0, y: 0 });

  // Update Zustand store on change (debounced or on interaction end to avoid high-frequency renders)
  const syncStore = useCallback(() => {
    setCameraStore({
      x: cameraX.get(),
      y: cameraY.get(),
      zoom: zoom.get(),
    });
  }, [cameraX, cameraY, zoom, setCameraStore]);

  // Zoom to a specific screen position (cursor)
  const zoomToCursor = useCallback(
    (clientX: number, clientY: number, delta: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const cursorX = clientX - rect.left;
      const cursorY = clientY - rect.top;

      const currentZoom = zoom.get();
      const currentX = cameraX.get();
      const currentY = cameraY.get();

      // World coordinates before zoom
      const worldX = (cursorX - currentX) / currentZoom;
      const worldY = (cursorY - currentY) / currentZoom;

      // Calculate next zoom
      const factor = delta < 0 ? 1.08 : 1 / 1.08;
      const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom * factor));

      // Calculate new camera position
      const nextX = cursorX - worldX * nextZoom;
      const nextY = cursorY - worldY * nextZoom;

      cameraX.set(nextX);
      cameraY.set(nextY);
      zoom.set(nextZoom);

      syncStore();
    },
    [cameraX, cameraY, zoom, syncStore]
  );

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // Prevent browser zoom/scroll
      e.preventDefault();
      zoomToCursor(e.clientX, e.clientY, e.deltaY);
    },
    [zoomToCursor]
  );

  // Panning operations
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const isMiddleClick = e.button === 1;
      const isPanTool = currentTool === "pan";
      const isSpaceHeld = e.shiftKey; // standard shortcut fallback or space if we had key listeners

      if (!isPanTool && !isMiddleClick && !isSpaceHeld && e.button !== 0) return;

      // Capture pointer
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      isPanning.current = true;
      startPointer.current = { x: e.clientX, y: e.clientY };
      startCamera.current = { x: cameraX.get(), y: cameraY.get() };
    },
    [cameraX, cameraY, currentTool]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning.current) return;

      const dx = e.clientX - startPointer.current.x;
      const dy = e.clientY - startPointer.current.y;

      cameraX.set(startCamera.current.x + dx);
      cameraY.set(startCamera.current.y + dy);
    },
    [cameraX, cameraY]
  );


  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning.current) return;
      isPanning.current = false;
      const target = e.currentTarget as HTMLElement;
      target.releasePointerCapture(e.pointerId);
      syncStore();
    },
    [syncStore]
  );

  const resetCamera = useCallback(() => {
    cameraX.set(0);
    cameraY.set(0);
    zoom.set(1);
    syncStore();
  }, [cameraX, cameraY, zoom, syncStore]);

  const fitToScreen = useCallback((assetBounds: { x: number; y: number; width: number; height: number }[]) => {
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
  }, [cameraX, cameraY, zoom, syncStore]);

  return {
    containerRef,
    cameraX,
    cameraY,
    zoom,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    resetCamera,
    fitToScreen,
  };
}
