"use client";

import { useMemo } from "react";
import { Asset } from "@/lib/types";
import { useUIStore } from "@/store/ui-store";

const VIEWPORT_PADDING = 300;

interface UseViewportCullingOptions {
  assets: Asset[];
}

export function useViewportCulling({ assets }: UseViewportCullingOptions) {
  const camera = useUIStore((state) => state.camera);

  const visibleAssets = useMemo(() => {
    const viewportWidth =
      typeof window !== "undefined" ? window.innerWidth : 1920;
    const viewportHeight =
      typeof window !== "undefined" ? window.innerHeight : 1080;

    const left = -camera.x / camera.zoom;
    const top = -camera.y / camera.zoom;
    const right = (viewportWidth - camera.x) / camera.zoom;
    const bottom = (viewportHeight - camera.y) / camera.zoom;

    const pad = VIEWPORT_PADDING / camera.zoom;

    return assets.filter((asset) => {
      const aw = asset.width || 280;
      const ah = asset.height || 210;

      return (
        asset.x + aw >= left - pad &&
        asset.x <= right + pad &&
        asset.y + ah >= top - pad &&
        asset.y <= bottom + pad
      );
    });
  }, [assets, camera]);

  return { visibleAssets };
}
