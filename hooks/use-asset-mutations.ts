import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Asset } from "@/lib/types";

export function useUpdateAssetLayout(folderId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      x,
      y,
      rotation,
      scale,
      z_index,
    }: {
      id: string;
      x?: number;
      y?: number;
      rotation?: number;
      scale?: number;
      z_index?: number;
    }) => {
      const updates: any = { updated_at: new Date().toISOString() };
      if (x !== undefined) updates.x = x;
      if (y !== undefined) updates.y = y;
      if (rotation !== undefined) updates.rotation = rotation;
      if (scale !== undefined) updates.scale = scale;
      if (z_index !== undefined) updates.z_index = z_index;

      const { data, error } = await supabase
        .from("assets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useDuplicateAsset(folderId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (asset: Asset) => {
      // Offset position and increment z_index
      const { data: highestZAsset } = await supabase
        .from("assets")
        .select("z_index")
        .eq("folder_id", folderId)
        .order("z_index", { ascending: false })
        .limit(1);

      const nextZIndex = (highestZAsset?.[0]?.z_index ?? 0) + 1;

      const duplicatedAsset = {
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
        z_index: nextZIndex,
      };

      const { data, error } = await supabase
        .from("assets")
        .insert(duplicatedAsset)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets", folderId] });
      queryClient.invalidateQueries({ queryKey: ["folder-preview", folderId] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}
