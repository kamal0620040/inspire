import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { FolderPreview } from "@/lib/types";

export function useFolderPreview(folderId: string, active: boolean) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["folder-preview", folderId],
    queryFn: async () => {
      // Get the latest 3 assets for the cover fan preview
      const { data, error } = await supabase
        .from("assets")
        .select("id, folder_id, url, thumbnail_url, type")
        .eq("folder_id", folderId)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error(`Error fetching preview for folder ${folderId}:`, error);
        throw error;
      }

      return (data || []) as FolderPreview[];
    },
    enabled: !!folderId && active,
  });
}

export function useFolderPreviews(folderIds: string[], active: boolean) {
  const supabase = createClient();
  const sortedIds = [...new Set(folderIds.filter(Boolean))].sort();

  return useQuery({
    queryKey: ["folder-previews", sortedIds],
    queryFn: async () => {
      if (sortedIds.length === 0) return {} as Record<string, FolderPreview[]>;

      const { data, error } = await supabase
        .from("assets")
        .select("id, folder_id, url, thumbnail_url, type, created_at")
        .in("folder_id", sortedIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching folder previews:", error);
        throw error;
      }

      const grouped: Record<string, FolderPreview[]> = {};
      for (const row of (data ?? []) as (FolderPreview & {
        created_at: string;
      })[]) {
        const list = grouped[row.folder_id] ?? [];
        if (list.length >= 3) continue;
        const { created_at: _createdAt, ...preview } = row;
        list.push(preview);
        grouped[row.folder_id] = list;
      }
      return grouped;
    },
    enabled: active && sortedIds.length > 0,
  });
}
