import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Asset } from "@/lib/types";

export type LayoutPatch = Partial<
  Pick<Asset, "x" | "y" | "rotation" | "scale" | "z_index">
>;

export interface LayoutUpdate extends LayoutPatch {
  id: string;
}

// Merges a partial layout patch into a cached asset.
function applyLayoutPatch(asset: Asset, patch: LayoutPatch): Asset {
  const next = { ...asset };
  for (const key of ["x", "y", "rotation", "scale", "z_index"] as const) {
    const value = patch[key];
    if (value !== undefined) next[key] = value;
  }
  next.updated_at = new Date().toISOString();
  return next;
}

export function useUpdateAssetLayout(folderId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const queryKey = ["assets", folderId];

  return useMutation({
    mutationFn: async ({ id, ...patch }: LayoutUpdate) => {
      const { data, error } = await supabase
        .from("assets")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Asset;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousAssets =
        queryClient.getQueryData<Asset[]>(queryKey);

      // Optimistic patch so the canvas doesn't snap back while the UPDATE
      // is in flight. Bring-to-front is intentional: every pointer-up bumps z.
      const { id, ...patch } = variables;
      queryClient.setQueryData<Asset[]>(queryKey, (old) => {
        if (!old) return old;
        return old.map((a) => (a.id === id ? applyLayoutPatch(a, patch) : a));
      });

      return { previousAssets };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousAssets) {
        queryClient.setQueryData(queryKey, context.previousAssets);
      }
    },
    onSuccess: (data) => {
      // Reconcile with the server row — no full-list refetch needed.
      queryClient.setQueryData<Asset[]>(queryKey, (old) => {
        if (!old) return old;
        return old.map((a) => (a.id === data.id ? data : a));
      });
    },
    onSettled: (_data, error) => {
      // Refetch only on error as a freshness backstop; success path is
      // already reconciled above (1 API call per drop instead of 2).
      if (error) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}


export function useUpdateAssetsUniform(folderId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ids,
      values,
    }: {
      ids: string[];
      values: LayoutPatch;
    }) => {
      if (ids.length === 0) return [] as Asset[];

      const { data, error } = await supabase
        .from("assets")
        .update({ ...values, updated_at: new Date().toISOString() })
        .in("id", ids)
        .select();

      if (error) throw error;
      return (data ?? []) as Asset[];
    },
    onError: (error) => {
      console.error("Bulk layout update failed:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets", folderId] });
    },
  });
}

export function useDeleteAsset(folderId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: asset, error: fetchError } = await supabase
        .from("assets")
        .select("storage_path")
        .eq("id", id)
        .single();
        
      if (fetchError) throw fetchError;

      const { error: dbError } = await supabase
        .from("assets")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      if (asset?.storage_path) {
        await supabase.storage.from("assets").remove([asset.storage_path]);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets", folderId] });
      queryClient.invalidateQueries({ queryKey: ["folder-preview", folderId] });
      queryClient.invalidateQueries({ queryKey: ["folder-previews"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useDeleteAssets(folderId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (ids.length === 0) return [];

      // 1. Get all asset storage paths in one query
      const { data: assets, error: fetchError } = await supabase
        .from("assets")
        .select("id, storage_path")
        .in("id", ids);
        
      if (fetchError) throw fetchError;

      // 2. Delete all DB rows in one query
      const { error: dbError } = await supabase
        .from("assets")
        .delete()
        .in("id", ids);

      if (dbError) throw dbError;

      // 3. Delete all storage files in parallel
      const storagePaths = (assets || [])
        .map((a) => a.storage_path)
        .filter((path): path is string => !!path);

      if (storagePaths.length > 0) {
        await supabase.storage.from("assets").remove(storagePaths);
      }

      return ids;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets", folderId] });
      queryClient.invalidateQueries({ queryKey: ["folder-preview", folderId] });
      queryClient.invalidateQueries({ queryKey: ["folder-previews"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

function toDuplicatedRow(asset: Asset, z_index: number) {
  return {
    folder_id: asset.folder_id,
    user_id: asset.user_id,
    type: asset.type,
    storage_path: asset.storage_path,
    thumbnail_path: asset.thumbnail_path,
    url: asset.url,
    thumbnail_url: asset.thumbnail_url,
    width: asset.width,
    height: asset.height,
    file_size: asset.file_size,
    file_name: asset.file_name ? `Copy of ${asset.file_name}` : null,
    x: asset.x + 35, // offset slightly
    y: asset.y + 35, // offset slightly
    rotation: asset.rotation,
    scale: asset.scale,
    z_index,
  };
}

async function resolveBaseZ(
  supabase: ReturnType<typeof createClient>,
  queryClient: ReturnType<typeof useQueryClient>,
  folderId: string
): Promise<number> {
  // Prefer the already-cached assets (no query) — fall back to one indexed
  // max lookup only when the cache is empty.
  const cached = queryClient.getQueryData<Asset[]>(["assets", folderId]);
  if (cached && cached.length > 0) {
    return cached.reduce((max, a) => Math.max(max, a.z_index || 0), 0);
  }
  const { data: highestZAsset } = await supabase
    .from("assets")
    .select("z_index")
    .eq("folder_id", folderId)
    .order("z_index", { ascending: false })
    .limit(1);
  return highestZAsset?.[0]?.z_index ?? 0;
}

export function useDuplicateAsset(folderId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (asset: Asset) => {
      // Offset position and increment z_index. resolveBaseZ prefers the
      // already-cached assets (no query) and only does one indexed max
      // lookup on cache miss (those use useDuplicateAssets for a single INSERT anyway).
      const baseZ = await resolveBaseZ(supabase, queryClient, folderId);
      const nextZIndex = baseZ + 1;

      const { data, error } = await supabase
        .from("assets")
        .insert(toDuplicatedRow(asset, nextZIndex))
        .select()
        .single();

      if (error) throw error;
      return data as Asset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets", folderId] });
      queryClient.invalidateQueries({ queryKey: ["folder-preview", folderId] });
      queryClient.invalidateQueries({ queryKey: ["folder-previews"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useDuplicateAssets(folderId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assets: Asset[]) => {
      if (assets.length === 0) return [] as Asset[];

      const baseZ = await resolveBaseZ(supabase, queryClient, folderId);
      const rows = assets.map((asset, i) =>
        toDuplicatedRow(asset, baseZ + i + 1)
      );

      const { data, error } = await supabase
        .from("assets")
        .insert(rows)
        .select();

      if (error) throw error;
      return (data ?? []) as Asset[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets", folderId] });
      queryClient.invalidateQueries({ queryKey: ["folder-preview", folderId] });
      queryClient.invalidateQueries({ queryKey: ["folder-previews"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}
