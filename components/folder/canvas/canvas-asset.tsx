"use client";

import { useMotionValue, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, useCallback, useTransition } from "react";
import { Asset } from "@/lib/types";
import { useUIStore } from "@/store/ui-store";
import { useUpdateAssetLayout, useDeleteAsset } from "@/hooks/use-asset-mutations";
import { Trash2, RotateCw, Loader2 } from "lucide-react";
import LazyImage from "@/components/media/lazy-image";
import LazyVideo from "@/components/media/lazy-video";

interface CanvasAssetProps {
  asset: Asset;
  folderId: string;
  onDoubleClick?: () => void;
}

export default function CanvasAsset({ asset, folderId, onDoubleClick }: CanvasAssetProps) {
  const queryClient = useQueryClient();
  const updateLayoutMutation = useUpdateAssetLayout(folderId);
  const deleteAssetMutation = useDeleteAsset(folderId);

  const { selectedIds, selectAsset, currentTool } = useUIStore();
  const isSelected = selectedIds.includes(asset.id);

  const x = useMotionValue(asset.x);
  const y = useMotionValue(asset.y);

  const [localZIndex, setLocalZIndex] = useState<number | string>(asset.z_index);
  const [localRotation, setLocalRotation] = useState(asset.rotation);
  const [localScale, setLocalScale] = useState(asset.scale);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  // Serializes rapid successive drops so overlapping UPDATEs can't land
  // out of order and resurrect a stale position (bring-to-front preserved:
  // every pointer-up still commits).
  const dropQueue = useRef<Promise<unknown>>(Promise.resolve());

  const [isDeleting, startTransition] = useTransition();

  useEffect(() => {
    x.set(asset.x);
    y.set(asset.y);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalZIndex(asset.z_index);
    setLocalRotation(asset.rotation);
    setLocalScale(asset.scale);
  }, [asset.x, asset.y, asset.z_index, asset.rotation, asset.scale, x, y]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (currentTool === "pan") return;

    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      e.stopPropagation();
      return;
    }

    e.stopPropagation();
    selectAsset(asset.id, e.shiftKey);

    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    dragStartPos.current = { x: x.get(), y: y.get() };

    setLocalZIndex(Number.MAX_SAFE_INTEGER - 100);

    const element = e.currentTarget as HTMLElement;
    element.setPointerCapture(e.pointerId);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isDragging.current) return;

      const camera = useUIStore.getState().camera;
      const zoom = camera.zoom || 1;

      const dx = (moveEvent.clientX - dragStart.current.x) / zoom;
      const dy = (moveEvent.clientY - dragStart.current.y) / zoom;

      x.set(dragStartPos.current.x + dx);
      y.set(dragStartPos.current.y + dy);
    };

    const handlePointerUp = async (upEvent: PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;

      try {
        element.releasePointerCapture(upEvent.pointerId);
      } catch {}

      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerup", handlePointerUp);

      const finalX = Math.round(x.get());
      const finalY = Math.round(y.get());

      const siblingAssets = queryClient.getQueryData<Asset[]>(["assets", folderId]) || [];
      const highestZ = siblingAssets.reduce((max, a) => {
        if (a.z_index >= Number.MAX_SAFE_INTEGER - 1000) return max;
        return Math.max(max, a.z_index);
      }, 0);

      const newZIndex = highestZ + 1;
      setLocalZIndex(newZIndex);

      // Chain onto the queue so a previous in-flight drop settles first.
      const task = dropQueue.current.then(() =>
        updateLayoutMutation.mutateAsync({
          id: asset.id,
          x: finalX,
          y: finalY,
          z_index: newZIndex,
        })
      );
      dropQueue.current = task.catch(() => {});
      await task;
    };

    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerup", handlePointerUp);
  }, [currentTool, asset.id, x, y, selectAsset, queryClient, folderId, updateLayoutMutation]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm("Delete this asset?")) {
      startTransition(async () => {
        await deleteAssetMutation.mutateAsync(asset.id);
      });
    }
  };

  const handleRotate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newRotation = (localRotation + 90) % 360;
    setLocalRotation(newRotation);
    await updateLayoutMutation.mutateAsync({
      id: asset.id,
      rotation: newRotation,
    });
  };

  const handleScaleChange = async (newScale: number) => {
    const clampedScale = Math.max(0.1, Math.min(5, newScale));
    setLocalScale(clampedScale);
    await updateLayoutMutation.mutateAsync({
      id: asset.id,
      scale: clampedScale,
    });
  };

  const handleWheel = async (e: React.WheelEvent) => {
    if (!isSelected || !e.ctrlKey && !e.metaKey) return;
    e.stopPropagation();
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.1, Math.min(5, localScale + delta));
    setLocalScale(newScale);
    await updateLayoutMutation.mutateAsync({
      id: asset.id,
      scale: newScale,
    });
  };

  const width = asset.width || 280;
  const height = asset.height || 210;

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick?.();
  };

  // Overlay is the asset's AXIS-ALIGNED bounding box (scaled + rotated
  // rect projected to screen axes)
  const rad = (localRotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const overlayWidth = width * localScale * cos + height * localScale * sin;
  const overlayHeight = width * localScale * sin + height * localScale * cos;
  const overlayX = (width - overlayWidth) / 2;
  const overlayY = (height - overlayHeight) / 2;

  const chromeVisibility = isSelected
    ? "opacity-100"
    : "opacity-0 group-hover:opacity-100";



  return (
    <motion.div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
      style={{
        x,
        y,
        zIndex: localZIndex,
        width,
        height,
      }}
      className="absolute canvas-asset group cursor-pointer"
    >
      {/* Visual asset box (scaled/rotated, clips media) */}
      <div
        style={{
          transform: `rotate(${localRotation}deg) scale(${localScale})`,
        }}
        className={`absolute inset-0 rounded-2xl bg-glass border backdrop-blur-sm shadow-lg overflow-hidden transition-shadow hover:shadow-xl ${
          isSelected
            ? "border-blue-500 ring-2 ring-blue-500 shadow-blue-500/10"
            : "border-white/40 hover:border-white/60"
        }`}
      >
        {/* Media Rendering */}
        <div className={`w-full h-full relative select-none pointer-events-none ${isDeleting ? 'opacity-50' : ''}`}>
          {isDeleting && (
            <Loader2 className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-white animate-spin" />
          )}
          {asset.type === "image" ? (
            <LazyImage
              src={asset.url}
              thumbnailSrc={asset.thumbnail_url}
              alt={asset.file_name || "Canvas Image"}
            />
          ) : (
            <LazyVideo
              src={asset.url}
              thumbnailSrc={asset.thumbnail_url}
            />
          )}
        </div>
      </div>

      {/* Screen-space chrome overlay (constant size, AABB-anchored) */}
      {currentTool === "select" && (
        <div
          style={{
            left: overlayX,
            top: overlayY,
            width: overlayWidth,
            height: overlayHeight,
          }}
          className="absolute pointer-events-none"
        >
          {/* Unified toolbar: floats above the image, never covers content */}
          <div
            onDoubleClick={(e) => e.stopPropagation()}
            className={`absolute -top-[52px] left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-glass/85 border border-black/10 dark:border-white/15 shadow-xl backdrop-blur-xl p-1 pointer-events-auto transition-opacity ${chromeVisibility}`}
          >
            <button
              type="button"
              onClick={handleRotate}
              className="h-8 w-8 rounded-full text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title="Rotate 90°"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title="Delete Asset"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="h-5 w-px bg-black/10 dark:bg-white/15 mx-0.5" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleScaleChange(localScale - 0.25); }}
              className="h-8 w-8 rounded-full text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 text-sm font-bold transition-colors cursor-pointer flex items-center justify-center"
              title="Zoom Out"
            >
              −
            </button>
            <span className="text-muted-foreground text-xs font-medium min-w-[44px] text-center select-none">
              {Math.round(localScale * 100)}%
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleScaleChange(localScale + 0.25); }}
              className="h-8 w-8 rounded-full text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 text-sm font-bold transition-colors cursor-pointer flex items-center justify-center"
              title="Zoom In"
            >
              +
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
