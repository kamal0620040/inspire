"use client";

import { useState } from "react";
import { motion, useTransform } from "framer-motion";
import { useAssets } from "@/hooks/use-assets";
import { useCamera } from "@/hooks/use-camera";
import { useUIStore } from "@/store/ui-store";
import { useDeleteAssets, useDuplicateAsset } from "@/hooks/use-asset-mutations";
import { useSelectionBox } from "@/hooks/use-selection-box";
import { useCanvasKeyboard } from "@/hooks/use-canvas-keyboard";
import { useViewportCulling } from "@/hooks/use-viewport-culling";
import CanvasAsset from "./canvas-asset";
import { CanvasLoadingOverlay } from "./canvas-loading-overlay";
import { MediaPreview } from "@/components/media/media-preview";
import { KeyboardShortcutsPanel } from "@/components/ui/keyboard-shortcuts";

interface CanvasViewProps {
  folderId: string;
}

export default function CanvasView({ folderId }: CanvasViewProps) {
  const { data: assets = [], isLoading, isLoadingError } = useAssets(folderId);
  const deleteAssetsMutation = useDeleteAssets(folderId);
  const duplicateAssetMutation = useDuplicateAsset(folderId);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const {
    containerRef,
    cameraX,
    cameraY,
    zoom,
    handlePointerDown: cameraPointerDown,
    handlePointerMove: cameraPointerMove,
    handlePointerUp: cameraPointerUp,
  } = useCamera();

  const { selectedIds, setSelection, clearSelection, currentTool } =
    useUIStore();

  const {
    selectionBox,
    handlePointerDown: selectionPointerDown,
    handlePointerMove: selectionPointerMove,
    handlePointerUp: selectionPointerUp,
  } = useSelectionBox({
    containerRef,
    cameraX,
    cameraY,
    zoom,
    assets,
    setSelection,
    clearSelection,
  });

  useCanvasKeyboard({
    folderId,
    selectedIds,
    assets,
    deleteAssetsMutation,
    duplicateAssetMutation,
    clearSelection,
    setSelection,
  });

  const { visibleAssets } = useViewportCulling({ assets });

  const openPreview = (assetId: string) => {
    const index = assets.findIndex((a) => a.id === assetId);
    if (index !== -1) {
      setPreviewIndex(index);
      setPreviewOpen(true);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const isMiddleClick = e.button === 1;
    if (currentTool === "pan" || isMiddleClick || e.shiftKey) {
      cameraPointerDown(e);
      return;
    }

    if (e.button !== 0) return;

    if (!selectionPointerDown(e)) {
      cameraPointerDown(e);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!selectionPointerMove(e)) {
      cameraPointerMove(e);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!selectionPointerUp(e)) {
      cameraPointerUp(e);
    }
  };

  const bgPosition = useTransform(
    [cameraX, cameraY],
    ([x, y]: number[]) => `${x}px ${y}px`
  );

  const bgSize = useTransform([zoom], ([z]: number[]) => `${32 * z}px ${32 * z}px`);

  if (isLoadingError) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-sm text-muted-foreground">
          Error loading assets. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`h-full w-full relative overflow-hidden select-none outline-none ${
        currentTool === "pan"
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-default"
      }`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      tabIndex={0}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, var(--grid) 1px, transparent 1.5px)`,
          backgroundPosition: bgPosition,
          backgroundSize: bgSize,
        }}
      />

      <motion.div
        className="absolute inset-0 transform-gpu origin-top-left"
        style={{
          x: cameraX,
          y: cameraY,
          scale: zoom,
        }}
      >
        {visibleAssets.map((asset) => (
          <CanvasAsset
            key={asset.id}
            asset={asset}
            folderId={folderId}
            onDoubleClick={() => openPreview(asset.id)}
          />
        ))}

        {selectionBox && (
          <div
            className="absolute border border-blue-500 bg-blue-500/10 rounded-sm pointer-events-none z-50"
            style={{
              left: Math.min(selectionBox.startX, selectionBox.currentX),
              top: Math.min(selectionBox.startY, selectionBox.currentY),
              width: Math.abs(selectionBox.currentX - selectionBox.startX),
              height: Math.abs(selectionBox.currentY - selectionBox.startY),
            }}
          />
        )}
      </motion.div>

      {isLoading && <CanvasLoadingOverlay />}

      <MediaPreview
        assets={assets}
        initialIndex={previewIndex}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />

      <KeyboardShortcutsPanel variant="canvas" />
    </div>
  );
}
