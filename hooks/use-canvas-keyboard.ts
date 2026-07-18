"use client";

import { useEffect, useMemo } from "react";
import { Asset } from "@/lib/types";
import { UseMutationResult } from "@tanstack/react-query";
import { useUpdateAssetLayout } from "@/hooks/use-asset-mutations";

interface UseCanvasKeyboardOptions {
  folderId: string;
  selectedIds: string[];
  assets: Asset[];
  deleteAssetsMutation: UseMutationResult<string[], Error, string[]>;
  duplicateAssetMutation: UseMutationResult<Asset, Error, Asset>;
  clearSelection: () => void;
  setSelection: (ids: string[]) => void;
}

export function useCanvasKeyboard({
  folderId,
  selectedIds,
  assets,
  deleteAssetsMutation,
  duplicateAssetMutation,
  clearSelection,
  setSelection,
}: UseCanvasKeyboardOptions) {
  const updateLayoutMutation = useUpdateAssetLayout(folderId);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      // Delete
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedIds.length > 0
      ) {
        e.preventDefault();
        if (confirm(`Delete ${selectedIds.length} asset(s)?`)) {
          await deleteAssetsMutation.mutateAsync(selectedIds);
          clearSelection();
        }
      }

      // Duplicate (Ctrl+D)
      if (
        (e.key === "d" || e.key === "D") &&
        (e.ctrlKey || e.metaKey) &&
        selectedIds.length > 0
      ) {
        e.preventDefault();
        const selectedAssets = assets.reduce<Asset[]>((acc, a) => {
          if (selectedIdSet.has(a.id)) acc.push(a);
          return acc;
        }, []);
        const results = await Promise.all(
          selectedAssets.map((asset) => duplicateAssetMutation.mutateAsync(asset))
        );
        const newSelection = results.filter((res) => res?.id).map((res) => res.id);
        setSelection(newSelection);
      }

      // Rotate (R) - 90 degrees clockwise
      if (
        (e.key === "r" || e.key === "R") &&
        !e.ctrlKey &&
        !e.metaKey &&
        selectedIds.length > 0
      ) {
        e.preventDefault();
        const selectedAssets = assets.filter((a) => selectedIdSet.has(a.id));
        await Promise.all(
          selectedAssets.map((asset) =>
            updateLayoutMutation.mutateAsync({
              id: asset.id,
              rotation: (asset.rotation + 90) % 360,
            })
          )
        );
      }

      // Scale In ( + or = )
      if (
        (e.key === "+" || e.key === "=") &&
        selectedIds.length > 0
      ) {
        e.preventDefault();
        const selectedAssets = assets.filter((a) => selectedIdSet.has(a.id));
        await Promise.all(
          selectedAssets.map((asset) =>
            updateLayoutMutation.mutateAsync({
              id: asset.id,
              scale: Math.min(5, asset.scale + 0.25),
            })
          )
        );
      }

      // Scale Out ( - )
      if (
        e.key === "-" &&
        selectedIds.length > 0
      ) {
        e.preventDefault();
        const selectedAssets = assets.filter((a) => selectedIdSet.has(a.id));
        await Promise.all(
          selectedAssets.map((asset) =>
            updateLayoutMutation.mutateAsync({
              id: asset.id,
              scale: Math.max(0.1, asset.scale - 0.25),
            })
          )
        );
      }

      // Reset Scale (0)
      if (
        e.key === "0" &&
        !e.ctrlKey &&
        !e.metaKey &&
        selectedIds.length > 0
      ) {
        e.preventDefault();
        const selectedAssets = assets.filter((a) => selectedIdSet.has(a.id));
        await Promise.all(
          selectedAssets.map((asset) =>
            updateLayoutMutation.mutateAsync({
              id: asset.id,
              scale: 1,
              rotation: 0,
            })
          )
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    folderId,
    selectedIds,
    selectedIdSet,
    assets,
    deleteAssetsMutation,
    duplicateAssetMutation,
    clearSelection,
    setSelection,
    updateLayoutMutation,
  ]);
}
