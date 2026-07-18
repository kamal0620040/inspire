"use client";

import { Asset } from "@/lib/types";
import { useUIStore } from "@/store/ui-store";
import { useDeleteAsset } from "@/hooks/use-asset-mutations";
import LazyImage from "@/components/media/lazy-image";
import LazyVideo from "@/components/media/lazy-video";
import { Trash2, CheckCircle2, Circle } from "lucide-react";

interface BoardCardProps {
  asset: Asset;
  folderId: string;
  onDoubleClick?: () => void;
}

export default function BoardCard({ asset, folderId, onDoubleClick }: BoardCardProps) {
  const deleteAssetMutation = useDeleteAsset(folderId);
  const { selectedIds, selectAsset } = useUIStore();
  const isSelected = selectedIds.includes(asset.id);

  const handleToggleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectAsset(asset.id, e.shiftKey || true); // toggle multi-select
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectAsset(asset.id, e.shiftKey);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this asset?")) {
      await deleteAssetMutation.mutateAsync(asset.id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick?.();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick(e as unknown as React.MouseEvent);
        }
      }}
      className={`relative rounded-2xl bg-glass border backdrop-blur-sm overflow-hidden group cursor-pointer aspect-video shadow-md hover:shadow-lg transition-all ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-500/20"
          : "border-white/40 hover:border-white/60"
      }`}
    >
      {/* Media Content */}
      <div className="w-full h-full relative select-none pointer-events-none">
        {asset.type === "image" ? (
          <LazyImage
            src={asset.url}
            thumbnailSrc={asset.thumbnail_url}
            alt={asset.file_name || "Board Image"}
          />
        ) : (
          <LazyVideo
            src={asset.url}
            thumbnailSrc={asset.thumbnail_url}
          />
        )}
      </div>

      {/* Select Overlay Circle Badge (visible on hover or if selected) */}
      <button
        type="button"
        onClick={handleToggleSelect}
        aria-label={isSelected ? "Deselect asset" : "Select asset"}
        className={`absolute top-3 left-3 z-20 p-1 rounded-full backdrop-blur-md transition-opacity cursor-pointer ${
          isSelected
            ? "bg-blue-600 text-white opacity-100"
            : "bg-black/35 text-white/70 hover:text-white opacity-0 group-hover:opacity-100"
        }`}
      >
        {isSelected ? (
          <CheckCircle2 className="h-4.5 w-4.5" />
        ) : (
          <Circle className="h-4.5 w-4.5" />
        )}
      </button>

      {/* Delete Trigger Button (visible on hover) */}
      <button
        type="button"
        onClick={handleDelete}
        className="absolute top-3 right-3 z-20 p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 cursor-pointer"
        title="Delete Asset"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      {/* File Name Label (subtle overlay at bottom) */}
      {asset.file_name && (
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none">
          <p className="text-xs font-medium truncate">{asset.file_name}</p>
        </div>
      )}
    </div>
  );
}
