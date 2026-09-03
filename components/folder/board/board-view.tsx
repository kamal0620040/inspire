"use client";

import { useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useAssets } from "@/hooks/use-assets";
import { useDeleteAssets, useDuplicateAssets } from "@/hooks/use-asset-mutations";
import { useCanvasKeyboard } from "@/hooks/use-canvas-keyboard";
import { useUIStore } from "@/store/ui-store";
import { useResponsiveColumns } from "@/hooks/use-responsive-columns";
import BoardCard from "./board-card";
import { UploadCloud, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { MediaPreview } from "@/components/media/media-preview";
import { KeyboardShortcutsPanel } from "@/components/ui/keyboard-shortcuts";

interface BoardViewProps {
  folderId: string;
}

const ROW_HEIGHT = 200;
const GAP = 24;

export default function BoardView({ folderId }: BoardViewProps) {
  const { data: assets = [], isLoading, error } = useAssets(folderId);
  const deleteAssetsMutation = useDeleteAssets(folderId);
  const duplicateAssetsMutation = useDuplicateAssets(folderId);

  const { selectedIds, setSelection, clearSelection } = useUIStore();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Callback-ref state (not useRef): the container mounts after the loading
  // spinner, so the measuring effect must re-run when the element appears.
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const columns = useResponsiveColumns(scrollEl);

  useCanvasKeyboard({
    folderId,
    selectedIds,
    assets,
    deleteAssetsMutation,
    duplicateAssetsMutation,
    clearSelection,
    setSelection,
  });

  const openPreview = (assetId: string) => {
    const index = assets.findIndex((a) => a.id === assetId);
    if (index !== -1) {
      setPreviewIndex(index);
      setPreviewOpen(true);
    }
  };

  const rowCount = Math.ceil(assets.length / columns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollEl,
    estimateSize: () => ROW_HEIGHT + GAP,
    overscan: 3,
  });

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8">
        <p className="text-red-500 font-medium">Failed to load assets</p>
      </div>
    );
  }

  return (
    <div
      ref={setScrollEl}
      className="h-full w-full overflow-y-auto px-8 pt-28 pb-32 bg-background"
      style={{
        backgroundImage: `radial-gradient(circle, var(--grid) 1px, transparent 1.5px)`,
        backgroundSize: `32px 32px`,
      }}
    >
      {assets.length === 0 ? (
        <div className="h-full w-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center max-w-md text-center p-8 rounded-3xl border border-dashed border-neutral-300 bg-glass/25 backdrop-blur-sm pointer-events-none select-none"
          >
            <UploadCloud className="h-12 w-12 text-neutral-400 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">Add some inspiration</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Drag and drop images or videos anywhere on the screen, or click the add button in the toolbar to upload.
            </p>
          </motion.div>
        </div>
      ) : (
        <div
          className="mx-auto max-w-7xl w-full relative"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const rowIndex = virtualRow.index;
            const startIndex = rowIndex * columns;
            const rowAssets = assets.slice(startIndex, startIndex + columns);

            return (
              <div
                key={virtualRow.key}
                className="absolute top-0 left-0 w-full"
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div
                  className="grid gap-6"
                  style={{
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  }}
                >
                  {rowAssets.map((asset) => (
                    <BoardCard
                      key={asset.id}
                      asset={asset}
                      folderId={folderId}
                      onDoubleClick={() => openPreview(asset.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MediaPreview
        assets={assets}
        initialIndex={previewIndex}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />

      <KeyboardShortcutsPanel variant="board" />
    </div>
  );
}
