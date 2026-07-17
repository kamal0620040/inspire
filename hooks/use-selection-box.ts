"use client";

import { useState, useRef, useCallback } from "react";
import { MotionValue } from "framer-motion";
import { Asset } from "@/lib/types";

interface SelectionBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface UseSelectionBoxOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  cameraX: MotionValue<number>;
  cameraY: MotionValue<number>;
  zoom: MotionValue<number>;
  assets: Asset[];
  setSelection: (ids: string[]) => void;
  clearSelection: () => void;
}

export function useSelectionBox({
  containerRef,
  cameraX,
  cameraY,
  zoom,
  assets,
  setSelection,
  clearSelection,
}: UseSelectionBoxOptions) {
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const isDraggingSelection = useRef(false);

  const dragStart = useRef({ x: 0, y: 0 });
  const dragCurrent = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const pendingSelection = useRef<string[] | null>(null);

  const getWorldCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const x = (clientX - rect.left - cameraX.get()) / zoom.get();
      const y = (clientY - rect.top - cameraY.get()) / zoom.get();
      return { x, y };
    },
    [containerRef, cameraX, cameraY, zoom]
  );

  const calculateIntersectingAssets = useCallback(
    (startX: number, startY: number, currentX: number, currentY: number) => {
      const x1 = Math.min(startX, currentX);
      const y1 = Math.min(startY, currentY);
      const x2 = Math.max(startX, currentX);
      const y2 = Math.max(startY, currentY);

      return assets
        .filter((asset) => {
          const aw = asset.width || 200;
          const ah = asset.height || 200;
          return (
            asset.x < x2 &&
            asset.x + aw > x1 &&
            asset.y < y2 &&
            asset.y + ah > y1
          );
        })
        .map((a) => a.id);
    },
    [assets]
  );

  const flushSelection = useCallback(() => {
    if (pendingSelection.current !== null) {
      setSelection(pendingSelection.current);
      pendingSelection.current = null;
    }
    rafId.current = null;
  }, [setSelection]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = e.target as HTMLElement;
      const clickedCanvasBg = target.closest(".canvas-asset") === null;

      if (clickedCanvasBg) {
        clearSelection();
        const { x, y } = getWorldCoords(e.clientX, e.clientY);

        isDraggingSelection.current = true;
        dragStart.current = { x, y };
        dragCurrent.current = { x, y };

        setSelectionBox({ startX: x, startY: y, currentX: x, currentY: y });

        target.setPointerCapture(e.pointerId);
        return true;
      }
      return false;
    },
    [clearSelection, getWorldCoords]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingSelection.current) return false;

      const { x, y } = getWorldCoords(e.clientX, e.clientY);
      dragCurrent.current = { x, y };

      setSelectionBox({
        startX: dragStart.current.x,
        startY: dragStart.current.y,
        currentX: x,
        currentY: y,
      });

      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(() => {
          const intersectingIds = calculateIntersectingAssets(
            dragStart.current.x,
            dragStart.current.y,
            dragCurrent.current.x,
            dragCurrent.current.y
          );
          pendingSelection.current = intersectingIds;
          flushSelection();
        });
      }

      return true;
    },
    [getWorldCoords, calculateIntersectingAssets, flushSelection]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingSelection.current) return false;

      isDraggingSelection.current = false;
      setSelectionBox(null);

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }

      const target = e.target as HTMLElement;
      try {
        target.releasePointerCapture(e.pointerId);
      } catch {}
      return true;
    },
    []
  );

  return {
    selectionBox,
    isDraggingSelection,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
